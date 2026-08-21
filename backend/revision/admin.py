from django.contrib import admin

from .models import RevisionMaterial, StudentRevisionRecommendation


@admin.register(RevisionMaterial)
class RevisionMaterialAdmin(admin.ModelAdmin):
    list_display = ("title", "topic", "tool_type", "weakness_type", "created_at")
    list_filter = ("tool_type", "weakness_type", "topic")
    search_fields = ("title",)


@admin.register(StudentRevisionRecommendation)
class StudentRevisionRecommendationAdmin(admin.ModelAdmin):
    list_display = (
        "student", "revision_material", "status", "recommended_at", "started_at", "completed_at",
    )
    list_filter = ("status",)
