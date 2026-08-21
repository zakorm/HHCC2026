import uuid

from django.db import models

from accounts.models import StudentProfile
from curriculum.models import Subject, Topic


class TopicClassification(models.TextChoices):
    STRONG = "strong", "Strong"
    WEAK = "weak", "Weak"
    NEUTRAL = "neutral", "Neutral"


class StudentTopicStat(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        StudentProfile, on_delete=models.CASCADE, related_name="topic_stats"
    )
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name="student_stats")
    correct_count = models.PositiveIntegerField(default=0)
    total_count = models.PositiveIntegerField(default=0)
    classification = models.CharField(
        max_length=10, choices=TopicClassification.choices, default=TopicClassification.NEUTRAL
    )
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["student", "topic"], name="uniq_student_topic")
        ]
        indexes = [models.Index(fields=["topic", "classification"])]

    @property
    def percentage(self):
        if self.total_count == 0:
            return 0
        return round(100 * self.correct_count / self.total_count, 2)


class StudentSubjectProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        StudentProfile, on_delete=models.CASCADE, related_name="subject_profiles"
    )
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name="student_profiles")
    assignments_count = models.PositiveIntegerField(default=0)
    profile_generated = models.BooleanField(default=False)
    recommended_focus_topic = models.ForeignKey(
        Topic, null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["student", "subject"], name="uniq_student_subject")
        ]
