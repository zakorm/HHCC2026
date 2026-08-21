import uuid

from django.conf import settings
from django.db import models

from accounts.models import StudentProfile
from revision.models import RevisionMaterial
from submissions.models import Submission


class ActivityEventType(models.TextChoices):
    SUBMISSION_MARKED = "submission_marked", "Submission marked"
    TOOL_STARTED = "tool_started", "Tool started"
    TOOL_COMPLETED = "tool_completed", "Tool completed"
    PROFILE_UPDATED = "profile_updated", "Profile updated"


class ActivityLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        StudentProfile, on_delete=models.CASCADE, related_name="activity_events"
    )
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    event_type = models.CharField(max_length=20, choices=ActivityEventType.choices)
    description = models.CharField(max_length=255)
    related_submission = models.ForeignKey(
        Submission, null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    related_material = models.ForeignKey(
        RevisionMaterial, null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    occurred_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["student", "-occurred_at"])]
        ordering = ["-occurred_at"]
