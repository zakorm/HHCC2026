from django.contrib import admin

from .models import StudentSubjectProfile, StudentTopicStat


@admin.register(StudentTopicStat)
class StudentTopicStatAdmin(admin.ModelAdmin):
    list_display = (
        "student", "topic", "correct_count", "total_count", "percentage", "classification",
        "last_updated",
    )
    list_filter = ("classification", "topic")


@admin.register(StudentSubjectProfile)
class StudentSubjectProfileAdmin(admin.ModelAdmin):
    list_display = (
        "student", "subject", "assignments_count", "profile_generated",
        "recommended_focus_topic", "last_updated",
    )
    list_filter = ("subject", "profile_generated")
