from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'ADMIN'
        )


class IsReceptionist(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'RECEPTIONIST'
        )


class IsProfessional(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'PROFESSIONAL'
        )


class IsPatient(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == 'PATIENT'
        )


class AppointmentPermission(BasePermission):

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        role = request.user.role

        if role in ['ADMIN', 'RECEPTIONIST']:
            return True

        if role in ['PROFESSIONAL', 'PATIENT']:
            return request.method in ['GET', 'HEAD', 'OPTIONS'] or (
                role == 'PATIENT' and request.method == 'POST'
            )

        return False

    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.role in ['ADMIN', 'RECEPTIONIST']:
            return True

        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            if user.role == 'PROFESSIONAL':
                return obj.doctor.user == user

            if user.role == 'PATIENT':
                return obj.patient.user == user

        return False