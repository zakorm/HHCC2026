from django.contrib import admin

from .models import Submission, SubmissionQuestion


class SubmissionQuestionInline(admin.TabularInline):
    model = SubmissionQuestion
    extra = 0


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = (
        "student", "school_class", "unit", "assignment_type", "status",
        "question_count", "submitted_at", "marked_at",
    )
    list_filter = ("status", "assignment_type", "school_class")
    inlines = [SubmissionQuestionInline]


@admin.register(SubmissionQuestion)
class SubmissionQuestionAdmin(admin.ModelAdmin):
    list_display = (
        "submission", "question_number", "topic", "ai_is_correct",
        "teacher_overridden", "final_is_correct",
    )
    list_filter = ("topic", "teacher_overridden")
