from datetime import time

from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from accounts.models import School, StudentProfile, TeacherProfile, User
from classroom.models import ClassSchedule, ClassStudent, ClassTeacher, SchoolClass
from curriculum.models import Subject


def make_user(school, role, username):
    return User.objects.create_user(
        username=username, email=f"{username}@example.com", password="pw12345!", role=role, school=school
    )


class ScheduleTestBase(APITestCase):
    def setUp(self):
        self.school = School.objects.create(name="Test School")
        self.subject = Subject.objects.create(name="Biology")

        self.teacher_user = make_user(self.school, User.Role.TEACHER, "teacher1")
        self.teacher = TeacherProfile.objects.create(user=self.teacher_user, school=self.school)

        self.other_teacher_user = make_user(self.school, User.Role.TEACHER, "teacher2")
        self.other_teacher = TeacherProfile.objects.create(user=self.other_teacher_user, school=self.school)

        self.admin_user = make_user(self.school, User.Role.ADMIN, "admin1")

        self.class_a = SchoolClass.objects.create(school=self.school, subject=self.subject, name="Biology 8B")
        ClassTeacher.objects.create(school_class=self.class_a, teacher=self.teacher)

        for i in range(2):
            student_user = make_user(self.school, User.Role.STUDENT, f"student{i}")
            student = StudentProfile.objects.create(user=student_user, school=self.school)
            ClassStudent.objects.create(school_class=self.class_a, student=student)

    def auth_as(self, user):
        token, _ = Token.objects.get_or_create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")


class TeacherScheduleViewTests(ScheduleTestBase):
    def test_empty_schedule(self):
        self.auth_as(self.teacher_user)
        response = self.client.get("/api/v1/teachers/me/schedule")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["data"], [])

    def test_one_slot(self):
        ClassSchedule.objects.create(
            school_class=self.class_a,
            day_of_week=1,
            start_time=time(9, 0),
            end_time=time(10, 0),
            room="Lab 2",
        )
        self.auth_as(self.teacher_user)
        response = self.client.get("/api/v1/teachers/me/schedule")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["data"]), 1)

        slot = response.data["data"][0]
        self.assertEqual(slot["day_of_week"], 1)
        self.assertEqual(slot["start_time"], "09:00")
        self.assertEqual(slot["end_time"], "10:00")
        self.assertEqual(slot["class_id"], str(self.class_a.id))
        self.assertEqual(slot["class_name"], "Biology 8B")
        self.assertEqual(slot["subject_name"], "Biology")
        self.assertEqual(slot["room"], "Lab 2")
        self.assertEqual(slot["student_count"], 2)

    def test_slot_for_other_teachers_class_is_not_visible(self):
        other_class = SchoolClass.objects.create(school=self.school, subject=self.subject, name="Chemistry 9A")
        ClassTeacher.objects.create(school_class=other_class, teacher=self.other_teacher)
        ClassSchedule.objects.create(
            school_class=other_class, day_of_week=1, start_time=time(9, 0), end_time=time(10, 0)
        )

        self.auth_as(self.teacher_user)
        response = self.client.get("/api/v1/teachers/me/schedule")
        self.assertEqual(response.data["data"], [])


class AdminClassScheduleViewTests(ScheduleTestBase):
    def test_create_slot(self):
        self.auth_as(self.admin_user)
        response = self.client.post(
            f"/api/v1/admin/classes/{self.class_a.id}/schedule",
            {"day_of_week": 1, "start_time": "09:00", "end_time": "10:00", "room": "Lab 2"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["room"], "Lab 2")
        self.assertFalse(response.data["teacher_overlap_warning"])
        self.assertEqual(ClassSchedule.objects.count(), 1)

    def test_non_admin_forbidden(self):
        self.auth_as(self.teacher_user)
        response = self.client.post(
            f"/api/v1/admin/classes/{self.class_a.id}/schedule",
            {"day_of_week": 1, "start_time": "09:00", "end_time": "10:00"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)

    def test_rejects_start_after_end(self):
        self.auth_as(self.admin_user)
        response = self.client.post(
            f"/api/v1/admin/classes/{self.class_a.id}/schedule",
            {"day_of_week": 1, "start_time": "10:00", "end_time": "09:00"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(ClassSchedule.objects.count(), 0)

    def test_rejects_overlap_same_class(self):
        ClassSchedule.objects.create(
            school_class=self.class_a, day_of_week=1, start_time=time(9, 0), end_time=time(10, 0)
        )
        self.auth_as(self.admin_user)
        response = self.client.post(
            f"/api/v1/admin/classes/{self.class_a.id}/schedule",
            {"day_of_week": 1, "start_time": "09:30", "end_time": "10:30"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(ClassSchedule.objects.count(), 1)

    def test_flags_but_does_not_block_cross_class_teacher_overlap(self):
        """Same teacher double-booked across two different classes at the same time
        is flagged in the response but still allowed (co-teaching / admin correction)."""
        class_b = SchoolClass.objects.create(school=self.school, subject=self.subject, name="Biology 9C")
        ClassTeacher.objects.create(school_class=class_b, teacher=self.teacher)
        ClassSchedule.objects.create(
            school_class=class_b, day_of_week=1, start_time=time(9, 0), end_time=time(10, 0)
        )

        self.auth_as(self.admin_user)
        response = self.client.post(
            f"/api/v1/admin/classes/{self.class_a.id}/schedule",
            {"day_of_week": 1, "start_time": "09:00", "end_time": "10:00"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data["teacher_overlap_warning"])
        self.assertEqual(ClassSchedule.objects.count(), 2)

    def test_different_teachers_same_day_no_conflict(self):
        """Two different teachers' classes booked at the same day/time is a
        completely normal, non-flagged case."""
        class_b = SchoolClass.objects.create(school=self.school, subject=self.subject, name="Chemistry 9A")
        ClassTeacher.objects.create(school_class=class_b, teacher=self.other_teacher)
        ClassSchedule.objects.create(
            school_class=class_b, day_of_week=1, start_time=time(9, 0), end_time=time(10, 0)
        )

        self.auth_as(self.admin_user)
        response = self.client.post(
            f"/api/v1/admin/classes/{self.class_a.id}/schedule",
            {"day_of_week": 1, "start_time": "09:00", "end_time": "10:00"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertFalse(response.data["teacher_overlap_warning"])


class RosterDrillDownTests(ScheduleTestBase):
    """The schedule drill-down reuses the existing /classes/{classId}/roster
    endpoint rather than a duplicate roster query."""

    def test_assigned_teacher_sees_correct_roster(self):
        slot = ClassSchedule.objects.create(
            school_class=self.class_a, day_of_week=1, start_time=time(9, 0), end_time=time(10, 0)
        )
        self.auth_as(self.teacher_user)
        response = self.client.get(f"/api/v1/classes/{slot.school_class_id}/roster")
        self.assertEqual(response.status_code, 200)

        roster_ids = {entry["student"]["id"] for entry in response.data["data"]}
        expected_ids = set(
            str(student_id)
            for student_id in ClassStudent.objects.filter(school_class=self.class_a).values_list(
                "student_id", flat=True
            )
        )
        self.assertEqual(roster_ids, expected_ids)

    def test_unassigned_teacher_forbidden(self):
        slot = ClassSchedule.objects.create(
            school_class=self.class_a, day_of_week=1, start_time=time(9, 0), end_time=time(10, 0)
        )
        self.auth_as(self.other_teacher_user)
        response = self.client.get(f"/api/v1/classes/{slot.school_class_id}/roster")
        self.assertEqual(response.status_code, 403)
