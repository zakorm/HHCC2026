from rest_framework import serializers

from accounts.models import StudentProfile, User
from activitylog.models import ActivityLog
from classroom.models import SchoolClass
from curriculum.models import Unit
from profiles.models import StudentSubjectProfile, StudentTopicStat
from revision.models import StudentRevisionRecommendation
from submissions.models import Submission, SubmissionQuestion


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="get_full_name")

    class Meta:
        model = User
        fields = ["id", "role", "full_name", "email", "avatar_initials"]


class StudentRefSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source="user_id")
    full_name = serializers.CharField(source="user.get_full_name")
    avatar_initials = serializers.CharField(source="user.avatar_initials")

    class Meta:
        model = StudentProfile
        fields = ["id", "full_name", "avatar_initials", "year_level"]


class ClassSummarySerializer(serializers.ModelSerializer):
    subject_id = serializers.UUIDField()

    class Meta:
        model = SchoolClass
        fields = ["id", "name", "subject_id"]


class UnitRefSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = ["id", "name"]


class RosterEntrySerializer(serializers.Serializer):
    student = StudentRefSerializer()
    assignments_count = serializers.IntegerField()
    weak_topic_count = serializers.IntegerField()


class PriorityGroupSerializer(serializers.Serializer):
    topic_id = serializers.UUIDField()
    topic_name = serializers.CharField()
    students = StudentRefSerializer(many=True)


class SubmissionQuestionSerializer(serializers.ModelSerializer):
    topic_id = serializers.UUIDField(read_only=True)
    ai_confidence = serializers.FloatField()

    class Meta:
        model = SubmissionQuestion
        fields = [
            "id", "question_number", "topic_id", "student_answer", "expected_answer",
            "ai_is_correct", "ai_confidence", "teacher_overridden", "final_is_correct",
        ]


class SubmissionSerializer(serializers.ModelSerializer):
    student = StudentRefSerializer()
    class_id = serializers.UUIDField(source="school_class_id")
    unit_id = serializers.UUIDField()

    class Meta:
        model = Submission
        fields = [
            "id", "student", "class_id", "unit_id", "assignment_type", "question_count",
            "status", "submitted_at", "marked_at",
        ]


class SubmissionDetailSerializer(SubmissionSerializer):
    questions = SubmissionQuestionSerializer(many=True)

    class Meta(SubmissionSerializer.Meta):
        fields = SubmissionSerializer.Meta.fields + ["questions"]


class SubmissionCreateSerializer(serializers.Serializer):
    photo = serializers.ImageField()
    student_id = serializers.UUIDField()
    class_id = serializers.UUIDField()
    unit_id = serializers.UUIDField()
    assignment_type = serializers.ChoiceField(choices=["classwork", "homework", "test", "exam"])


class QuestionOverrideSerializer(serializers.Serializer):
    final_is_correct = serializers.BooleanField()
    note = serializers.CharField(required=False, allow_blank=True)


class TopicStatSerializer(serializers.Serializer):
    topic_id = serializers.UUIDField()
    topic_name = serializers.CharField()
    percentage = serializers.FloatField()
    classification = serializers.CharField()


class SubjectSummarySerializer(serializers.Serializer):
    subject_id = serializers.UUIDField()
    subject_name = serializers.CharField()
    assignments_count = serializers.IntegerField()
    profile_generated = serializers.BooleanField()


class SubjectProfileSerializer(serializers.Serializer):
    subject_id = serializers.UUIDField()
    subject_name = serializers.CharField()
    assignments_count = serializers.IntegerField()
    updated_at = serializers.DateTimeField()
    strong_topic = TopicStatSerializer(allow_null=True)
    weak_topic = TopicStatSerializer(allow_null=True)
    recommended_focus_topic_id = serializers.UUIDField(allow_null=True)
    topics = TopicStatSerializer(many=True)


class RecommendationSerializer(serializers.ModelSerializer):
    topic_id = serializers.UUIDField(source="revision_material.topic_id")
    tool_type = serializers.CharField(source="revision_material.tool_type")
    title = serializers.CharField(source="revision_material.title")
    description = serializers.CharField(source="revision_material.description")

    class Meta:
        model = StudentRevisionRecommendation
        fields = [
            "id", "topic_id", "tool_type", "title", "description", "reason", "status",
            "recommended_at", "started_at", "completed_at",
        ]


class StudentSummarySerializer(serializers.Serializer):
    assignments_this_term = serializers.IntegerField()
    strong_topic_count = serializers.IntegerField()
    flagged_topic_count = serializers.IntegerField()


class ActivityEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = ["id", "event_type", "description", "occurred_at"]
