import uuid

from django.db import models

from accounts.models import StudentProfile, TeacherProfile
from classroom.models import SchoolClass
from curriculum.models import Topic, Unit


class AssignmentType(models.TextChoices):
    CLASSWORK = "classwork", "Classwork"
    HOMEWORK = "homework", "Homework"
    TEST = "test", "Test"
    EXAM = "exam", "Exam"


class SubmissionStatus(models.TextChoices):
    PROCESSING = "processing", "Processing"
    MARKED = "marked", "Marked"
    NEEDS_REVIEW = "needs_review", "Needs review"


class Submission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        StudentProfile, on_delete=models.CASCADE, related_name="submissions"
    )
    school_class = models.ForeignKey(
        SchoolClass, on_delete=models.CASCADE, related_name="submissions"
    )
    unit = models.ForeignKey(Unit, on_delete=models.PROTECT, related_name="submissions")
    uploaded_by = models.ForeignKey(
        TeacherProfile, on_delete=models.PROTECT, related_name="uploaded_submissions"
    )
    assignment_type = models.CharField(max_length=20, choices=AssignmentType.choices)
    photo = models.ImageField(upload_to="submissions/%Y/%m/")
    question_count = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=20, choices=SubmissionStatus.choices, default=SubmissionStatus.PROCESSING
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    marked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["student", "status"]),
            models.Index(fields=["school_class"]),
        ]

    def __str__(self):
        return f"{self.student} — {self.unit} ({self.status})"


class SubmissionQuestion(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    submission = models.ForeignKey(
        Submission, on_delete=models.CASCADE, related_name="questions"
    )
    question_number = models.PositiveIntegerField()
    topic = models.ForeignKey(Topic, on_delete=models.PROTECT, related_name="submission_questions")
    student_answer = models.TextField(blank=True)
    expected_answer = models.TextField(blank=True)
    ai_is_correct = models.BooleanField(null=True)
    ai_confidence = models.DecimalField(max_digits=4, decimal_places=3, null=True, blank=True)
    teacher_overridden = models.BooleanField(default=False)
    final_is_correct = models.BooleanField(null=True)
    reviewed_by = models.ForeignKey(
        TeacherProfile, null=True, blank=True, on_delete=models.SET_NULL, related_name="reviewed_questions"
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["submission", "question_number"], name="uniq_submission_question_number"
            )
        ]
        indexes = [models.Index(fields=["topic"])]
