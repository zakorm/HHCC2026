from django.utils import timezone

from profiles.models import StudentSubjectProfile, StudentTopicStat, TopicClassification


def build_topic_stat(stat):
    return {
        "topic_id": stat.topic_id,
        "topic_name": stat.topic.name,
        "percentage": stat.percentage,
        "classification": stat.classification,
    }


def build_subject_profile(student, subject):
    profile = StudentSubjectProfile.objects.filter(student=student, subject=subject).first()
    stats = list(
        StudentTopicStat.objects.filter(student=student, topic__subject=subject).select_related("topic")
    )
    topics = [build_topic_stat(s) for s in stats]

    strong_candidates = [s for s in stats if s.classification == TopicClassification.STRONG]
    weak_candidates = [s for s in stats if s.classification == TopicClassification.WEAK]
    strong = max(strong_candidates, key=lambda s: s.percentage, default=None)
    weak = min(weak_candidates, key=lambda s: s.percentage, default=None)

    return {
        "subject_id": subject.id,
        "subject_name": subject.name,
        "assignments_count": profile.assignments_count if profile else 0,
        "updated_at": profile.last_updated if profile else timezone.now(),
        "strong_topic": build_topic_stat(strong) if strong else None,
        "weak_topic": build_topic_stat(weak) if weak else None,
        "recommended_focus_topic_id": profile.recommended_focus_topic_id if profile else None,
        "topics": topics,
    }
