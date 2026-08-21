from django.contrib import admin

from .models import ActivityLog


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ("student", "event_type", "description", "actor", "occurred_at")
    list_filter = ("event_type",)
    search_fields = ("description",)
