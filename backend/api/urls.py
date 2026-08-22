from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter(trailing_slash=False)
router.register(r"admin/schools", views.SchoolViewSet, basename="admin-school")
router.register(r"admin/subjects", views.SubjectViewSet, basename="admin-subject")
router.register(r"admin/units", views.UnitViewSet, basename="admin-unit")
router.register(r"admin/topics", views.TopicViewSet, basename="admin-topic")
router.register(r"admin/classes", views.AdminClassViewSet, basename="admin-class")
router.register(r"admin/revision-materials", views.RevisionMaterialViewSet, basename="admin-revision-material")

urlpatterns = [
    path("auth/login", views.LoginView.as_view()),
    path("auth/refresh", views.RefreshView.as_view()),
    path("auth/logout", views.LogoutView.as_view()),
    path("me", views.MeView.as_view()),

    path("classes", views.ClassListView.as_view()),
    path("classes/<uuid:class_id>/students", views.ClassStudentsView.as_view()),
    path("classes/<uuid:class_id>/roster", views.ClassRosterView.as_view()),
    path("classes/<uuid:class_id>/priorities", views.ClassPrioritiesView.as_view()),
    path("subjects/<uuid:subject_id>/units", views.SubjectUnitsView.as_view()),

    path("submissions", views.SubmissionListCreateView.as_view()),
    path("submissions/<uuid:submission_id>", views.SubmissionDetailView.as_view()),
    path("submissions/<uuid:submission_id>/questions/<uuid:question_id>", views.QuestionOverrideView.as_view()),
    path("submissions/<uuid:submission_id>/reprocess", views.ReprocessView.as_view()),

    path("ocr/pdf", views.OcrPdfView.as_view()),

    path("students/<uuid:student_id>/subjects", views.StudentSubjectsView.as_view()),
    path("students/<uuid:student_id>/subjects/<uuid:subject_id>/profile", views.StudentSubjectProfileView.as_view()),
    path("students/<uuid:student_id>/recommendations", views.RecommendationListView.as_view()),
    path("recommendations/<uuid:recommendation_id>/start", views.RecommendationStartView.as_view()),
    path("recommendations/<uuid:recommendation_id>/complete", views.RecommendationCompleteView.as_view()),

    path("parents/me/children", views.ParentChildrenView.as_view()),
    path("students/<uuid:student_id>/summary", views.StudentSummaryView.as_view()),
    path("students/<uuid:student_id>/activity", views.StudentActivityView.as_view()),

    path("admin/parent-links", views.ParentLinkView.as_view()),
    path("admin/classes/<uuid:class_id>/teachers", views.AddClassTeacherView.as_view()),
    path("admin/classes/<uuid:class_id>/students", views.AddClassStudentView.as_view()),

    path("", include(router.urls)),
]
