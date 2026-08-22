import uuid

from django.db import models

from accounts.models import School, StudentProfile, TeacherProfile
from curriculum.models import Subject


class SchoolClass(models.Model):
    """A taught class, e.g. 'Biology 8B'. Named SchoolClass to avoid the `class` keyword."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="classes")
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="classes")
    name = models.CharField(max_length=150)  # "Biology 8B"
    year_level = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    teachers = models.ManyToManyField(
        TeacherProfile, through="ClassTeacher", related_name="classes"
    )
    students = models.ManyToManyField(
        StudentProfile, through="ClassStudent", related_name="classes"
    )

    def __str__(self):
        return self.name


class ClassTeacher(models.Model):
    school_class = models.ForeignKey(SchoolClass, on_delete=models.CASCADE)
    teacher = models.ForeignKey(TeacherProfile, on_delete=models.CASCADE)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["school_class", "teacher"], name="uniq_class_teacher"
            )
        ]


class ClassStudent(models.Model):
    school_class = models.ForeignKey(SchoolClass, on_delete=models.CASCADE)
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE)
    enrolled_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["school_class", "student"], name="uniq_class_student"
            )
        ]


class ClassSchedule(models.Model):
    """A recurring weekly timetable slot for a class, e.g. Mon 9-10am in Lab 2."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    school_class = models.ForeignKey(
        SchoolClass, on_delete=models.CASCADE, related_name="schedule_slots"
    )
    day_of_week = models.PositiveSmallIntegerField()  # 0=Sunday ... 6=Saturday
    start_time = models.TimeField()
    end_time = models.TimeField()
    room = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["school_class"]),
            models.Index(fields=["day_of_week"]),
        ]

    def __str__(self):
        return f"{self.school_class} - day {self.day_of_week} {self.start_time}-{self.end_time}"
