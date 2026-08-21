"""
Fake AI Scanner marking pipeline.

Real OCR/answer-evaluation is out of scope for this pass (see
claude-code-brief/PRD.md and api_design.md). This module stands in for the
"worker -> POST /internal/submissions/{id}/marking-result" call described
there: it's invoked synchronously right after a submission is created (or on
/reprocess) instead of over HTTP from a separate worker process, but performs
the same steps -- write submission_questions, flip status, recompute stats,
generate recommendations, log activity.
"""

import random
from decimal import Decimal

from django.utils import timezone

from activitylog.models import ActivityEventType, ActivityLog
from profiles.models import StudentSubjectProfile, StudentTopicStat, TopicClassification
from revision.models import RecommendationStatus, RevisionMaterial, StudentRevisionRecommendation
from submissions.models import Submission, SubmissionQuestion, SubmissionStatus

# Cutoffs and thresholds below aren't fixed by product yet (see schema_notes.md
# "Open questions") -- kept as module constants so they're easy to retune
# without touching the pipeline logic.
STRONG_CUTOFF = 70
WEAK_CUTOFF = 50
NEEDS_REVIEW_CONFIDENCE_THRESHOLD = Decimal("0.65")
PROFILE_GENERATION_THRESHOLD = 1


def _fake_mark_question(topic):
    is_correct = random.random() < 0.65
    confidence = Decimal(str(round(random.uniform(0.55, 0.99), 3)))
    return is_correct, confidence


def run_marking(submission):
    """(Re)generate marked questions for a submission and cascade stat updates."""
    topics = list(submission.unit.topics.all())
    if not topics:
        topics = list(submission.unit.subject.topics.all())
    if not topics:
        raise ValueError(f"No topics available under unit {submission.unit_id} to mark against")

    submission.questions.all().delete()

    question_count = submission.question_count or random.randint(5, 8)
    submission.question_count = question_count

    confidences = []
    touched_topic_ids = set()
    for question_number in range(1, question_count + 1):
        topic = random.choice(topics)
        is_correct, confidence = _fake_mark_question(topic)
        confidences.append(confidence)
        touched_topic_ids.add(topic.id)
        SubmissionQuestion.objects.create(
            submission=submission,
            question_number=question_number,
            topic=topic,
            ai_is_correct=is_correct,
            ai_confidence=confidence,
        )

    avg_confidence = sum(confidences) / len(confidences)
    submission.status = (
        SubmissionStatus.NEEDS_REVIEW
        if avg_confidence < NEEDS_REVIEW_CONFIDENCE_THRESHOLD
        else SubmissionStatus.MARKED
    )
    submission.marked_at = timezone.now()
    submission.save(update_fields=["question_count", "status", "marked_at"])

    recompute_topic_stats(submission.student, touched_topic_ids)
    recompute_subject_profile(submission.student, submission.unit.subject)
    generate_recommendations(submission.student, touched_topic_ids)

    ActivityLog.objects.create(
        student=submission.student,
        actor=submission.uploaded_by.user,
        event_type=ActivityEventType.SUBMISSION_MARKED,
        description=f"{submission.unit.subject.name} {submission.assignment_type} marked",
        related_submission=submission,
    )

    return submission


def _effective_is_correct(question):
    return question.final_is_correct if question.final_is_correct is not None else question.ai_is_correct


def recompute_topic_stats(student, topic_ids):
    for topic_id in topic_ids:
        questions = SubmissionQuestion.objects.filter(
            submission__student=student, topic_id=topic_id
        )
        total = questions.count()
        correct = sum(1 for q in questions if _effective_is_correct(q))

        percentage = round(100 * correct / total, 2) if total else 0
        if percentage >= STRONG_CUTOFF:
            classification = TopicClassification.STRONG
        elif percentage <= WEAK_CUTOFF:
            classification = TopicClassification.WEAK
        else:
            classification = TopicClassification.NEUTRAL

        StudentTopicStat.objects.update_or_create(
            student=student,
            topic_id=topic_id,
            defaults={
                "correct_count": correct,
                "total_count": total,
                "classification": classification,
            },
        )


def recompute_subject_profile(student, subject):
    assignments_count = submission_count_for_subject(student, subject)

    weak_stat = (
        StudentTopicStat.objects.filter(
            student=student, topic__subject=subject, classification=TopicClassification.WEAK
        )
        .order_by("correct_count")
        .first()
    )
    focus_topic = weak_stat.topic if weak_stat else None

    profile, _ = StudentSubjectProfile.objects.update_or_create(
        student=student,
        subject=subject,
        defaults={
            "assignments_count": assignments_count,
            "profile_generated": assignments_count >= PROFILE_GENERATION_THRESHOLD,
            "recommended_focus_topic": focus_topic,
        },
    )
    return profile


def submission_count_for_subject(student, subject):
    return Submission.objects.filter(
        student=student, unit__subject=subject
    ).exclude(status=SubmissionStatus.PROCESSING).count()


def generate_recommendations(student, topic_ids):
    weak_topic_ids = StudentTopicStat.objects.filter(
        student=student, topic_id__in=topic_ids, classification=TopicClassification.WEAK
    ).values_list("topic_id", flat=True)

    for topic_id in weak_topic_ids:
        material = RevisionMaterial.objects.filter(topic_id=topic_id).first()
        if not material:
            continue
        already_active = StudentRevisionRecommendation.objects.filter(
            student=student,
            revision_material=material,
            status__in=[RecommendationStatus.RECOMMENDED, RecommendationStatus.STARTED],
        ).exists()
        if already_active:
            continue
        StudentRevisionRecommendation.objects.create(
            student=student,
            revision_material=material,
            reason=f"Flagged as weak in {material.topic.name}",
        )
