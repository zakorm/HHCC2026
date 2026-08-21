from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import ParentProfile, ParentStudentLink, School, StudentProfile, TeacherProfile, User


@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ("name", "id", "created_at")
    search_fields = ("name",)


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ("username", "email", "first_name", "last_name", "role", "school", "is_staff")
    list_filter = ("role", "school", "is_staff")
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("Jstyoucation", {"fields": ("role", "school", "avatar_initials")}),
    )


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "school", "year_level", "created_at")
    list_filter = ("school", "year_level")


@admin.register(TeacherProfile)
class TeacherProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "school", "created_at")
    list_filter = ("school",)


@admin.register(ParentProfile)
class ParentProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "created_at")


@admin.register(ParentStudentLink)
class ParentStudentLinkAdmin(admin.ModelAdmin):
    list_display = ("parent", "student", "relationship")
    list_filter = ("relationship",)
