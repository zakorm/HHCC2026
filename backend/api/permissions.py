from rest_framework.exceptions import PermissionDenied

from accounts.models import User
from classroom.models import ClassStudent, ClassTeacher


def is_admin(user):
    return user.is_staff or user.role == User.Role.ADMIN


def teacher_class_ids(user):
    """IDs of classes this user teaches (empty if not a teacher)."""
    if not hasattr(user, "teacher_profile"):
        return set()
    return set(
        ClassTeacher.objects.filter(teacher=user.teacher_profile).values_list(
            "school_class_id", flat=True
        )
    )


def linked_student_ids(user):
    """IDs of StudentProfile this user may read: self, own children, or taught students."""
    if hasattr(user, "student_profile"):
        return {user.student_profile.user_id}
    if hasattr(user, "parent_profile"):
        return set(
            user.parent_profile.child_links.values_list("student_id", flat=True)
        )
    if hasattr(user, "teacher_profile"):
        class_ids = teacher_class_ids(user)
        return set(
            ClassStudent.objects.filter(school_class_id__in=class_ids).values_list(
                "student_id", flat=True
            )
        )
    return set()


def require_student_access(user, student_id):
    if is_admin(user):
        return
    if student_id not in linked_student_ids(user):
        raise PermissionDenied("You do not have access to this student.")


def require_class_access(user, class_id):
    if is_admin(user):
        return
    if class_id not in teacher_class_ids(user):
        raise PermissionDenied("You do not have access to this class.")
