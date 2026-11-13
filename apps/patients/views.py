from rest_framework import viewsets
from rest_framework.permissions import BasePermission

from .models import Patient
from .serializers import PatientSerializer


class PatientPermission(BasePermission):

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.user.role in ['ADMIN', 'RECEPTIONIST']:
            return True

        if request.user.role == 'PATIENT':
            return request.method in ['GET', 'HEAD', 'OPTIONS']

        return False

    def has_object_permission(self, request, view, obj):
        if request.user.role in ['ADMIN', 'RECEPTIONIST']:
            return True

        if request.user.role == 'PATIENT':
            return obj.user == request.user

        return False


class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [PatientPermission]

    def get_queryset(self):
        user = self.request.user

        if user.role in ['ADMIN', 'RECEPTIONIST']:
            return Patient.objects.all()

        if user.role == 'PATIENT':
            return Patient.objects.filter(user=user)

        return Patient.objects.none()