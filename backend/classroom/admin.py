from django.contrib import admin

from .models import ClassSchedule, ClassStudent, ClassTeacher, SchoolClass


class ClassTeacherInline(admin.TabularInline):
    model = ClassTeacher
    extra = 1


class ClassStudentInline(admin.TabularInline):
    model = ClassStudent
    extra = 1


@admin.register(SchoolClass)
class SchoolClassAdmin(admin.ModelAdmin):
    list_display = ("name", "school", "subject", "year_level", "created_at")
    list_filter = ("school", "subject", "year_level")
    search_fields = ("name",)
    inlines = [ClassTeacherInline, ClassStudentInline]


@admin.register(ClassTeacher)
class ClassTeacherAdmin(admin.ModelAdmin):
    list_display = ("school_class", "teacher")
    list_filter = ("school_class",)


@admin.register(ClassStudent)
class ClassStudentAdmin(admin.ModelAdmin):
    list_display = ("school_class", "student", "enrolled_at")
    list_filter = ("school_class",)


@admin.register(ClassSchedule)
class ClassScheduleAdmin(admin.ModelAdmin):
    list_display = ("school_class", "day_of_week", "start_time", "end_time", "room")
    list_filter = ("school_class", "day_of_week")
