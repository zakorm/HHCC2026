import uuid

from django.db import models

from accounts.models import StudentProfile
from curriculum.models import Topic


class ToolType(models.TextChoices):
    FLASHCARDS = "flashcards", "Flashcards"
    CONCEPT_SHEET = "concept_sheet", "Concept sheet"
    QUIZ = "quiz", "Quiz"
    VIDEO = "video", "Video"


class WeaknessType(models.TextChoices):
    RECALL = "recall", "Recall"
    CONCEPTUAL = "conceptual", "Conceptual"
    PROCEDURAL = "procedural", "Procedural"


class RecommendationStatus(models.TextChoices):
    RECOMMENDED = "recommended", "Recommended"
    STARTED = "started", "Started"
    COMPLETED = "completed", "Completed"


class RevisionMaterial(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name="revision_materials")
    tool_type = models.CharField(max_length=20, choices=ToolType.choices)
    weakness_type = models.CharField(max_length=20, choices=WeaknessType.choices)
    title = models.CharField(max_length=200)  # "Flash cards — Organisms"
    description = models.CharField(max_length=255, blank=True)  # "Recall-based"
    content_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class StudentRevisionRecommendation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        StudentProfile, on_delete=models.CASCADE, related_name="recommendations"
    )
    revision_material = models.ForeignKey(
        RevisionMaterial, on_delete=models.CASCADE, related_name="recommendations"
    )
    reason = models.CharField(max_length=255, blank=True)
    status = models.CharField(
        max_length=15, choices=RecommendationStatus.choices, default=RecommendationStatus.RECOMMENDED
    )
    recommended_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["student", "status"])]
