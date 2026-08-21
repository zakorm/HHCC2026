from django.contrib import admin

from .models import Subject, Topic, Unit


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ("name", "id")
    search_fields = ("name",)


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ("name", "subject")
    list_filter = ("subject",)
    search_fields = ("name",)


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ("name", "unit", "subject")
    list_filter = ("subject", "unit")
    search_fields = ("name",)
