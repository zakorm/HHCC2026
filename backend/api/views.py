import tempfile
from pathlib import Path

from django.contrib.auth import authenticate
from django.db.models import Count
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import ParentStudentLink, School, StudentProfile, User
from accounts.serializers import SchoolSerializer
from activitylog.models import ActivityLog
from classroom.models import ClassSchedule, ClassStudent, ClassTeacher, SchoolClass
from classroom.serializers import SchoolClassSerializer
from curriculum.models import Subject, Topic, Unit
from curriculum.serializers import SubjectSerializer, TopicSerializer, UnitSerializer
from profiles.models import StudentSubjectProfile, StudentTopicStat, TopicClassification
from revision.models import RecommendationStatus, RevisionMaterial, StudentRevisionRecommendation
from revision.serializers import RevisionMaterialSerializer
from submissions.models import Submission, SubmissionQuestion, SubmissionStatus

from . import marking, ocr_pipeline, topic_analysis
from .exceptions import error_response
from .pagination import EnvelopePagination
from .permissions import is_admin, require_class_access, require_student_access, teacher_class_ids
from .serializers import (
    ActivityEventSerializer,
    ClassSummarySerializer,
    PriorityGroupSerializer,
    QuestionOverrideSerializer,
    RecommendationSerializer,
    RosterEntrySerializer,
    ScheduleSlotAdminSerializer,
    ScheduleSlotCreateSerializer,
    ScheduleSlotSerializer,
    StudentRefSerializer,
    StudentSummarySerializer,
    SubjectProfileSerializer,
    SubjectSummarySerializer,
    SubmissionCreateSerializer,
    SubmissionDetailSerializer,
    SubmissionQuestionSerializer,
    SubmissionSerializer,
    UnitRefSerializer,
    UserSerializer,
)
from .services import build_subject_profile


# ---------------------------------------------------------------- Auth / Me

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return error_response("invalid_credentials", "Invalid credentials.", status.HTTP_401_UNAUTHORIZED)

        user = authenticate(request, username=user.username, password=password)
        if user is None:
            return error_response("invalid_credentials", "Invalid credentials.", status.HTTP_401_UNAUTHORIZED)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            "access_token": token.key,
            "refresh_token": token.key,
            "user": UserSerializer(user).data,
        })


class RefreshView(APIView):
    """
    Simplified refresh: we use static DRF auth tokens (no JWT expiry), so
    there's nothing to actually exchange. Kept as its own endpoint to match
    the shape in openapi.yaml in case this moves to real JWTs later.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get("refresh_token")
        if not Token.objects.filter(key=refresh_token).exists():
            return error_response("invalid_refresh_token", "Invalid refresh token.", status.HTTP_401_UNAUTHORIZED)
        return Response({"access_token": refresh_token})


class LogoutView(APIView):
    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        user = request.user
        for field in ("first_name", "last_name", "avatar_initials"):
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()
        return Response(UserSerializer(user).data)


# ---------------------------------------------------------------- Classes

class ClassListView(generics.ListAPIView):
    serializer_class = ClassSummarySerializer
    pagination_class = EnvelopePagination

    def get_queryset(self):
        user = self.request.user
        if is_admin(user):
            return SchoolClass.objects.order_by("name")
        return SchoolClass.objects.filter(id__in=teacher_class_ids(user)).order_by("name")


class ClassStudentsView(generics.ListAPIView):
    serializer_class = StudentRefSerializer
    pagination_class = EnvelopePagination

    def get_queryset(self):
        class_id = self.kwargs["class_id"]
        require_class_access(self.request.user, class_id)
        student_ids = ClassStudent.objects.filter(school_class_id=class_id).values_list("student_id", flat=True)
        return StudentProfile.objects.filter(user_id__in=student_ids)


class ClassRosterView(APIView):
    def get(self, request, class_id):
        require_class_access(request.user, class_id)
        student_ids = ClassStudent.objects.filter(school_class_id=class_id).values_list("student_id", flat=True)
        school_class = get_object_or_404(SchoolClass, id=class_id)

        entries = []
        for student in StudentProfile.objects.filter(user_id__in=student_ids):
            assignments_count = Submission.objects.filter(
                student=student, unit__subject=school_class.subject
            ).exclude(status=SubmissionStatus.PROCESSING).count()
            weak_topic_count = StudentTopicStat.objects.filter(
                student=student, topic__subject=school_class.subject, classification=TopicClassification.WEAK
            ).count()
            entries.append({
                "student": student,
                "assignments_count": assignments_count,
                "weak_topic_count": weak_topic_count,
            })
        return Response({"data": RosterEntrySerializer(entries, many=True).data})


class ClassPrioritiesView(APIView):
    def get(self, request, class_id):
        require_class_access(request.user, class_id)
        school_class = get_object_or_404(SchoolClass, id=class_id)
        student_ids = ClassStudent.objects.filter(school_class_id=class_id).values_list("student_id", flat=True)

        weak_stats = StudentTopicStat.objects.filter(
            student_id__in=student_ids, topic__subject=school_class.subject, classification=TopicClassification.WEAK
        ).select_related("topic", "student", "student__user")

        groups = {}
        for stat in weak_stats:
            group = groups.setdefault(stat.topic_id, {"topic_id": stat.topic_id, "topic_name": stat.topic.name, "students": []})
            group["students"].append(stat.student)

        return Response({"data": PriorityGroupSerializer(list(groups.values()), many=True).data})


class TeacherScheduleView(APIView):
    """Weekly timetable for the current teacher, across every class they teach."""

    def get(self, request):
        class_ids = teacher_class_ids(request.user)
        slots = ClassSchedule.objects.filter(school_class_id__in=class_ids).select_related(
            "school_class", "school_class__subject"
        ).order_by("day_of_week", "start_time")

        student_counts = dict(
            ClassStudent.objects.filter(school_class_id__in=class_ids)
            .values("school_class_id")
            .annotate(count=Count("student_id"))
            .values_list("school_class_id", "count")
        )

        data = [
            {
                "day_of_week": slot.day_of_week,
                "start_time": slot.start_time,
                "end_time": slot.end_time,
                "class_id": slot.school_class_id,
                "class_name": slot.school_class.name,
                "subject_name": slot.school_class.subject.name,
                "room": slot.room,
                "student_count": student_counts.get(slot.school_class_id, 0),
            }
            for slot in slots
        ]
        return Response({"data": ScheduleSlotSerializer(data, many=True).data})


class SubjectUnitsView(generics.ListAPIView):
    serializer_class = UnitRefSerializer
    pagination_class = EnvelopePagination

    def get_queryset(self):
        return Unit.objects.filter(subject_id=self.kwargs["subject_id"])


# ---------------------------------------------------------------- Submissions

class SubmissionListCreateView(generics.ListCreateAPIView):
    pagination_class = EnvelopePagination

    def get_serializer_class(self):
        return SubmissionCreateSerializer if self.request.method == "POST" else SubmissionSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Submission.objects.select_related("student", "student__user")
        if not is_admin(user):
            qs = qs.filter(school_class_id__in=teacher_class_ids(user))
        class_id = self.request.query_params.get("class_id")
        student_id = self.request.query_params.get("student_id")
        status_filter = self.request.query_params.get("status")
        if class_id:
            qs = qs.filter(school_class_id=class_id)
        if student_id:
            qs = qs.filter(student_id=student_id)
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs.order_by("-submitted_at")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        require_class_access(request.user, data["class_id"])
        teacher_profile = request.user.teacher_profile

        submission = Submission.objects.create(
            student_id=data["student_id"],
            school_class_id=data["class_id"],
            unit_id=data["unit_id"],
            uploaded_by=teacher_profile,
            assignment_type=data["assignment_type"],
            photo=data["photo"],
        )
        marking.run_marking(submission)
        return Response(SubmissionSerializer(submission).data, status=status.HTTP_201_CREATED)


class SubmissionDetailView(generics.RetrieveAPIView):
    serializer_class = SubmissionDetailSerializer
    queryset = Submission.objects.select_related("student", "student__user").prefetch_related("questions")
    lookup_url_kwarg = "submission_id"

    def get_object(self):
        submission = super().get_object()
        require_class_access(self.request.user, submission.school_class_id)
        return submission


class QuestionOverrideView(APIView):
    def patch(self, request, submission_id, question_id):
        question = get_object_or_404(SubmissionQuestion, id=question_id, submission_id=submission_id)
        require_class_access(request.user, question.submission.school_class_id)

        serializer = QuestionOverrideSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        question.final_is_correct = serializer.validated_data["final_is_correct"]
        question.teacher_overridden = True
        question.reviewed_by = request.user.teacher_profile
        question.reviewed_at = timezone.now()
        question.save()

        marking.recompute_topic_stats(question.submission.student, {question.topic_id})
        marking.recompute_subject_profile(question.submission.student, question.topic.subject)

        return Response(SubmissionQuestionSerializer(question).data)


class ReprocessView(APIView):
    def post(self, request, submission_id):
        submission = get_object_or_404(Submission, id=submission_id)
        require_class_access(request.user, submission.school_class_id)
        if submission.status != SubmissionStatus.NEEDS_REVIEW:
            return error_response(
                "invalid_state",
                "Only submissions needing review can be reprocessed.",
                status.HTTP_400_BAD_REQUEST,
            )
        marking.run_marking(submission)
        return Response(status=status.HTTP_202_ACCEPTED)


# ---------------------------------------------------------------- OCR pipeline

class OcrPdfView(APIView):
    """
    General-purpose PDF/image -> Markdown OCR (GOT-OCR2.0 by default), with
    optional topic strength/weakness classification chained on when a
    `unit_id` is provided. Standalone/ad-hoc use -- doesn't persist
    anything. `marking.py` calls the same `ocr_pipeline`/`topic_analysis`
    modules directly for the real submissions/marking flow (photo uploads,
    not PDFs, and it does persist).

    Requires the heavy deps in requirements-ocr.txt to be installed.
    """

    def post(self, request):
        upload = request.FILES.get("file")
        if not upload:
            return error_response(
                "missing_file", "A `file` (PDF, PNG, or JPG) upload is required.", status.HTTP_400_BAD_REQUEST
            )
        suffix = Path(upload.name).suffix.lower()
        if suffix not in (".pdf",) + ocr_pipeline.IMAGE_EXTENSIONS:
            return error_response(
                "invalid_file", "Only PDF, PNG, or JPG files are supported.", status.HTTP_400_BAD_REQUEST
            )

        try:
            dpi = int(request.data.get("dpi", ocr_pipeline.DEFAULT_DPI))
        except (TypeError, ValueError):
            return error_response("invalid_dpi", "`dpi` must be an integer.", status.HTTP_400_BAD_REQUEST)
        mode = request.data.get("mode", ocr_pipeline.DEFAULT_MODE)

        unit_id = request.data.get("unit_id")
        unit = None
        if unit_id:
            unit = get_object_or_404(Unit, id=unit_id)

        with tempfile.NamedTemporaryFile(suffix=suffix) as tmp_file:
            for chunk in upload.chunks():
                tmp_file.write(chunk)
            tmp_file.flush()

            try:
                if suffix == ".pdf":
                    markdown, failed_pages = ocr_pipeline.process_pdf(tmp_file.name, dpi=dpi, mode=mode)
                else:
                    markdown, failed_pages = ocr_pipeline.process_image(tmp_file.name, mode=mode)
            except ocr_pipeline.OcrPipelineError as exc:
                return error_response(
                    "ocr_pipeline_error", str(exc), status.HTTP_422_UNPROCESSABLE_ENTITY
                )

        payload = {
            "filename": upload.name,
            "markdown": markdown,
            "failed_pages": failed_pages,
        }

        if unit is not None:
            topics = list(unit.topics.all()) or list(unit.subject.topics.all())
            if not topics:
                return error_response(
                    "no_topics",
                    f"No topics available under unit {unit_id} to classify against.",
                    status.HTTP_422_UNPROCESSABLE_ENTITY,
                )
            try:
                analysis = topic_analysis.analyze_topics(markdown, topics)
            except topic_analysis.TopicAnalysisError as exc:
                return error_response(
                    "topic_analysis_error", str(exc), status.HTTP_422_UNPROCESSABLE_ENTITY
                )
            payload["strong_topics"] = TopicSerializer(analysis["strong"], many=True).data
            payload["needs_improvement_topics"] = TopicSerializer(analysis["needs_improvement"], many=True).data

        return Response(payload)


# ---------------------------------------------------------------- Student profile

class StudentSubjectsView(APIView):
    def get(self, request, student_id):
        require_student_access(request.user, student_id)
        student = get_object_or_404(StudentProfile, user_id=student_id)
        profiles = StudentSubjectProfile.objects.filter(student=student).select_related("subject")
        data = [
            {
                "subject_id": p.subject_id,
                "subject_name": p.subject.name,
                "assignments_count": p.assignments_count,
                "profile_generated": p.profile_generated,
            }
            for p in profiles
        ]
        return Response({"data": SubjectSummarySerializer(data, many=True).data})


class StudentSubjectProfileView(APIView):
    def get(self, request, student_id, subject_id):
        require_student_access(request.user, student_id)
        student = get_object_or_404(StudentProfile, user_id=student_id)
        subject = get_object_or_404(Subject, id=subject_id)
        payload = build_subject_profile(student, subject)
        return Response(SubjectProfileSerializer(payload).data)


# ---------------------------------------------------------------- Recommendations

class RecommendationListView(generics.ListAPIView):
    serializer_class = RecommendationSerializer
    pagination_class = EnvelopePagination

    def get_queryset(self):
        student_id = self.kwargs["student_id"]
        require_student_access(self.request.user, student_id)
        qs = StudentRevisionRecommendation.objects.filter(student_id=student_id).select_related("revision_material")
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs.order_by("-recommended_at")


class RecommendationStartView(APIView):
    def post(self, request, recommendation_id):
        rec = get_object_or_404(StudentRevisionRecommendation, id=recommendation_id)
        require_student_access(request.user, rec.student_id)
        rec.status = RecommendationStatus.STARTED
        rec.started_at = timezone.now()
        rec.save()
        ActivityLog.objects.create(
            student=rec.student,
            actor=request.user,
            event_type="tool_started",
            description=f"{rec.student.user.get_full_name()} started {rec.revision_material.title}",
        )
        return Response(RecommendationSerializer(rec).data)


class RecommendationCompleteView(APIView):
    def post(self, request, recommendation_id):
        rec = get_object_or_404(StudentRevisionRecommendation, id=recommendation_id)
        require_student_access(request.user, rec.student_id)
        rec.status = RecommendationStatus.COMPLETED
        rec.completed_at = timezone.now()
        rec.save()
        ActivityLog.objects.create(
            student=rec.student,
            actor=request.user,
            event_type="tool_completed",
            description=f"{rec.student.user.get_full_name()} completed {rec.revision_material.title}",
        )
        return Response(RecommendationSerializer(rec).data)


# ---------------------------------------------------------------- Parent

class ParentChildrenView(generics.ListAPIView):
    serializer_class = StudentRefSerializer

    def get_queryset(self):
        if not hasattr(self.request.user, "parent_profile"):
            return StudentProfile.objects.none()
        student_ids = self.request.user.parent_profile.child_links.values_list("student_id", flat=True)
        return StudentProfile.objects.filter(user_id__in=student_ids)

    def list(self, request, *args, **kwargs):
        return Response({"data": self.get_serializer(self.get_queryset(), many=True).data})


class StudentSummaryView(APIView):
    def get(self, request, student_id):
        require_student_access(request.user, student_id)
        student = get_object_or_404(StudentProfile, user_id=student_id)
        assignments_this_term = Submission.objects.filter(student=student).exclude(
            status=SubmissionStatus.PROCESSING
        ).count()
        strong_topic_count = StudentTopicStat.objects.filter(
            student=student, classification=TopicClassification.STRONG
        ).count()
        flagged_topic_count = StudentTopicStat.objects.filter(
            student=student, classification=TopicClassification.WEAK
        ).count()
        payload = {
            "assignments_this_term": assignments_this_term,
            "strong_topic_count": strong_topic_count,
            "flagged_topic_count": flagged_topic_count,
        }
        return Response(StudentSummarySerializer(payload).data)


class StudentActivityView(generics.ListAPIView):
    serializer_class = ActivityEventSerializer

    def get_queryset(self):
        student_id = self.kwargs["student_id"]
        require_student_access(self.request.user, student_id)
        qs = ActivityLog.objects.filter(student_id=student_id).order_by("-occurred_at")
        before = self.request.query_params.get("before")
        if before:
            qs = qs.filter(occurred_at__lt=before)
        limit = int(self.request.query_params.get("limit", 20))
        return qs[:limit]

    def list(self, request, *args, **kwargs):
        return Response({"data": self.get_serializer(self.get_queryset(), many=True).data})


# ---------------------------------------------------------------- Admin / content management

class IsAdminRole(IsAdminUser):
    def has_permission(self, request, view):
        return request.user.is_authenticated and is_admin(request.user)


class SchoolViewSet(viewsets.ModelViewSet):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [IsAdminRole]


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAdminRole]


class UnitViewSet(viewsets.ModelViewSet):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
    permission_classes = [IsAdminRole]


class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    permission_classes = [IsAdminRole]


class AdminClassViewSet(viewsets.ModelViewSet):
    queryset = SchoolClass.objects.all()
    serializer_class = SchoolClassSerializer
    permission_classes = [IsAdminRole]


class RevisionMaterialViewSet(viewsets.ModelViewSet):
    queryset = RevisionMaterial.objects.all()
    serializer_class = RevisionMaterialSerializer
    permission_classes = [IsAdminRole]


class ParentLinkView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request):
        parent_id = request.data.get("parent_id")
        student_id = request.data.get("student_id")
        relationship = request.data.get("relationship", "")
        link, _ = ParentStudentLink.objects.get_or_create(
            parent_id=parent_id, student_id=student_id, defaults={"relationship": relationship}
        )
        return Response({"id": link.id, "parent_id": parent_id, "student_id": student_id}, status=status.HTTP_201_CREATED)


class AddClassTeacherView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, class_id):
        teacher_id = request.data.get("teacher_id")
        ClassTeacher.objects.get_or_create(school_class_id=class_id, teacher_id=teacher_id)
        return Response(status=status.HTTP_201_CREATED)


class AddClassStudentView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, class_id):
        student_id = request.data.get("student_id")
        ClassStudent.objects.get_or_create(school_class_id=class_id, student_id=student_id)
        return Response(status=status.HTTP_201_CREATED)


class AdminClassScheduleView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, class_id):
        get_object_or_404(SchoolClass, id=class_id)

        serializer = ScheduleSlotCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if data["start_time"] >= data["end_time"]:
            return error_response(
                "invalid_time_range", "start_time must be before end_time.", status.HTTP_400_BAD_REQUEST
            )

        overlap = ClassSchedule.objects.filter(
            school_class_id=class_id,
            day_of_week=data["day_of_week"],
            start_time__lt=data["end_time"],
            end_time__gt=data["start_time"],
        ).exists()
        if overlap:
            return error_response(
                "overlapping_slot",
                "This slot overlaps another slot already scheduled for this class.",
                status.HTTP_400_BAD_REQUEST,
            )

        # Same teacher double-booked across different classes: flag, don't block --
        # co-teaching or admin error correction may legitimately need this.
        teacher_ids = ClassTeacher.objects.filter(school_class_id=class_id).values_list("teacher_id", flat=True)
        sibling_class_ids = set(
            ClassTeacher.objects.filter(teacher_id__in=teacher_ids)
            .exclude(school_class_id=class_id)
            .values_list("school_class_id", flat=True)
        )
        teacher_overlap = ClassSchedule.objects.filter(
            school_class_id__in=sibling_class_ids,
            day_of_week=data["day_of_week"],
            start_time__lt=data["end_time"],
            end_time__gt=data["start_time"],
        ).exists()

        slot = ClassSchedule.objects.create(school_class_id=class_id, **data)
        payload = ScheduleSlotAdminSerializer(slot).data
        payload["teacher_overlap_warning"] = teacher_overlap
        return Response(payload, status=status.HTTP_201_CREATED)
