import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models


class School(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class User(AbstractUser):
    class Role(models.TextChoices):
        TEACHER = "teacher", "Teacher"
        STUDENT = "student", "Student"
        PARENT = "parent", "Parent"
        ADMIN = "admin", "Admin"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    school = models.ForeignKey(
        School, null=True, blank=True, on_delete=models.SET_NULL, related_name="users"
    )
    role = models.CharField(max_length=10, choices=Role.choices)
    email = models.EmailField(unique=True)
    avatar_initials = models.CharField(max_length=4, blank=True)

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"


class StudentProfile(models.Model):
    user = models.OneToOneField(
        User, primary_key=True, on_delete=models.CASCADE, related_name="student_profile"
    )
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="students")
    year_level = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.get_full_name() or self.user.username


class TeacherProfile(models.Model):
    user = models.OneToOneField(
        User, primary_key=True, on_delete=models.CASCADE, related_name="teacher_profile"
    )
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name="teachers")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.get_full_name() or self.user.username


class ParentProfile(models.Model):
    user = models.OneToOneField(
        User, primary_key=True, on_delete=models.CASCADE, related_name="parent_profile"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.get_full_name() or self.user.username


class ParentStudentLink(models.Model):
    parent = models.ForeignKey(
        ParentProfile, on_delete=models.CASCADE, related_name="child_links"
    )
    student = models.ForeignKey(
        StudentProfile, on_delete=models.CASCADE, related_name="parent_links"
    )
    relationship = models.CharField(max_length=50, blank=True)  # "mother", "guardian", ...

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["parent", "student"], name="uniq_parent_student"
            )
        ]

    def __str__(self):
        return f"{self.parent} -> {self.student}"
