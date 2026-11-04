from rest_framework import viewsets
from rest_framework.permissions import BasePermission

from .models import Doctor
from .serializers import DoctorSerializer


class DoctorPermission(BasePermission):

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.user.role in ['ADMIN', 'RECEPTIONIST']:
            return True

        if request.user.role in ['PROFESSIONAL', 'PATIENT']:
            return request.method in ['GET', 'HEAD', 'OPTIONS']

        return False

    def has_object_permission(self, request, view, obj):
        if request.user.role in ['ADMIN', 'RECEPTIONIST']:
            return True

        if request.user.role == 'PROFESSIONAL':
            return obj.user == request.user

        if request.user.role == 'PATIENT':
            return request.method in ['GET', 'HEAD', 'OPTIONS']

        return False


class DoctorViewSet(viewsets.ModelViewSet):
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [DoctorPermission]

    def get_queryset(self):
        user = self.request.user

        if user.role in ['ADMIN', 'RECEPTIONIST']:
            return Doctor.objects.all()

        if user.role == 'PROFESSIONAL':
            return Doctor.objects.filter(user=user)

        if user.role == 'PATIENT':
            return Doctor.objects.filter(is_available=True)

        return Doctor.objects.none()