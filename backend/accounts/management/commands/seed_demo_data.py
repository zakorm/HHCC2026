import io

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from accounts.models import ParentProfile, ParentStudentLink, School, StudentProfile, TeacherProfile, User
from api import marking
from activitylog.models import ActivityEventType, ActivityLog
from classroom.models import ClassStudent, ClassTeacher, SchoolClass
from curriculum.models import Subject, Topic, Unit
from revision.models import RevisionMaterial, StudentRevisionRecommendation, ToolType, WeaknessType
from submissions.models import AssignmentType, Submission, SubmissionQuestion, SubmissionStatus

DEMO_PASSWORD = "demo1234"


def _placeholder_photo(name):
    from PIL import Image

    buffer = io.BytesIO()
    Image.new("RGB", (4, 4), color=(200, 200, 200)).save(buffer, format="PNG")
    return ContentFile(buffer.getvalue(), name=name)


class Command(BaseCommand):
    help = "Seed the demo dataset implied by claude-code-brief/mockup_reference.html"

    @transaction.atomic
    def handle(self, *args, **options):
        school, _ = School.objects.get_or_create(name="Riverside Middle School")

        biology, _ = Subject.objects.get_or_create(name="Biology")
        unit, _ = Unit.objects.get_or_create(subject=biology, name="Cells & Organisms")
        topic_names = ["Cells", "Organisms", "Genetics", "Ecosystems", "Human body"]
        topics = {
            name: Topic.objects.get_or_create(unit=unit, subject=biology, name=name)[0]
            for name in topic_names
        }

        mana_user, created = User.objects.get_or_create(
            username="mana",
            defaults=dict(
                email="mana@riverside.edu", first_name="Mana", last_name="Adeyemi",
                role=User.Role.TEACHER, school=school, avatar_initials="MA",
            ),
        )
        if created:
            mana_user.set_password(DEMO_PASSWORD)
            mana_user.save()
        mana_teacher, _ = TeacherProfile.objects.get_or_create(user=mana_user, school=school)

        toby_user, created = User.objects.get_or_create(
            username="toby.king",
            defaults=dict(
                email="toby.king@riverside.edu", first_name="Toby", last_name="King",
                role=User.Role.STUDENT, school=school, avatar_initials="TK",
            ),
        )
        if created:
            toby_user.set_password(DEMO_PASSWORD)
            toby_user.save()
        toby_student, _ = StudentProfile.objects.get_or_create(
            user=toby_user, school=school, defaults={"year_level": "Year 8"}
        )

        kevin_user, created = User.objects.get_or_create(
            username="kevin.marsh",
            defaults=dict(
                email="kevin.marsh@riverside.edu", first_name="Kevin", last_name="Marsh",
                role=User.Role.STUDENT, school=school, avatar_initials="KM",
            ),
        )
        if created:
            kevin_user.set_password(DEMO_PASSWORD)
            kevin_user.save()
        kevin_student, _ = StudentProfile.objects.get_or_create(
            user=kevin_user, school=school, defaults={"year_level": "Year 8"}
        )

        rk_user, created = User.objects.get_or_create(
            username="rachel.king",
            defaults=dict(
                email="rachel.king@example.com", first_name="Rachel", last_name="King",
                role=User.Role.PARENT, avatar_initials="RK",
            ),
        )
        if created:
            rk_user.set_password(DEMO_PASSWORD)
            rk_user.save()
        rk_parent, _ = ParentProfile.objects.get_or_create(user=rk_user)
        ParentStudentLink.objects.get_or_create(parent=rk_parent, student=toby_student, defaults={"relationship": "mother"})

        biology_8b, _ = SchoolClass.objects.get_or_create(
            school=school, subject=biology, name="Biology 8B", defaults={"year_level": "Year 8"}
        )
        ClassTeacher.objects.get_or_create(school_class=biology_8b, teacher=mana_teacher)
        ClassStudent.objects.get_or_create(school_class=biology_8b, student=toby_student)
        ClassStudent.objects.get_or_create(school_class=biology_8b, student=kevin_student)

        # A marked test for Toby: Cells ~78% (strong), Organisms ~46% (weak).
        submission, created = Submission.objects.get_or_create(
            student=toby_student,
            school_class=biology_8b,
            unit=unit,
            uploaded_by=mana_teacher,
            assignment_type=AssignmentType.TEST,
            defaults={
                "photo": _placeholder_photo("toby_biology_test.png"),
                "question_count": 22,
                "status": SubmissionStatus.PROCESSING,
            },
        )
        if created:
            cells_results = [True] * 7 + [False] * 2  # 7/9 = 77.78% ~78%
            organisms_results = [True] * 6 + [False] * 7  # 6/13 = 46.15% ~46%

            question_number = 1
            for is_correct in cells_results:
                SubmissionQuestion.objects.create(
                    submission=submission, question_number=question_number,
                    topic=topics["Cells"], ai_is_correct=is_correct, ai_confidence=0.9,
                )
                question_number += 1
            for is_correct in organisms_results:
                SubmissionQuestion.objects.create(
                    submission=submission, question_number=question_number,
                    topic=topics["Organisms"], ai_is_correct=is_correct, ai_confidence=0.9,
                )
                question_number += 1

            submission.status = SubmissionStatus.MARKED
            submission.marked_at = timezone.now()
            submission.save(update_fields=["status", "marked_at"])

            marking.recompute_topic_stats(toby_student, {topics["Cells"].id, topics["Organisms"].id})
            marking.recompute_subject_profile(toby_student, biology)

            ActivityLog.objects.create(
                student=toby_student, actor=mana_user, event_type=ActivityEventType.SUBMISSION_MARKED,
                description="Biology test marked · Organisms flagged", related_submission=submission,
            )

        flashcards, _ = RevisionMaterial.objects.get_or_create(
            topic=topics["Organisms"], tool_type=ToolType.FLASHCARDS,
            defaults={
                "weakness_type": WeaknessType.RECALL,
                "title": "Flash cards — Organisms",
                "description": "Recall-based",
            },
        )
        concept_sheet, _ = RevisionMaterial.objects.get_or_create(
            topic=topics["Organisms"], tool_type=ToolType.CONCEPT_SHEET,
            defaults={
                "weakness_type": WeaknessType.CONCEPTUAL,
                "title": "Concept sheet — Organisms",
                "description": "Conceptual gaps",
            },
        )

        flash_rec, created = StudentRevisionRecommendation.objects.get_or_create(
            student=toby_student, revision_material=flashcards,
            defaults={"reason": "Flagged as weak in Organisms"},
        )
        if created:
            flash_rec.status = "started"
            flash_rec.started_at = timezone.now()
            flash_rec.save(update_fields=["status", "started_at"])
            ActivityLog.objects.create(
                student=toby_student, actor=toby_user, event_type=ActivityEventType.TOOL_STARTED,
                description="Toby started flash cards on organisms",
            )

        concept_rec, created = StudentRevisionRecommendation.objects.get_or_create(
            student=toby_student, revision_material=concept_sheet,
            defaults={"reason": "Flagged as weak in Organisms"},
        )

        if created:
            ActivityLog.objects.create(
                student=toby_student, actor=mana_user, event_type=ActivityEventType.PROFILE_UPDATED,
                description="Biology learning profile updated — focus: Organisms",
            )

        self.stdout.write(self.style.SUCCESS(
            "Seeded demo data. Login with any of: mana / toby.king / kevin.marsh / rachel.king "
            f"(password: {DEMO_PASSWORD}) using their email address."
        ))
