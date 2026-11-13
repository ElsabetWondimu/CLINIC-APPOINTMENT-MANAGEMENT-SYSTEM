from rest_framework import viewsets
from .models import Appointment
from .serializers import AppointmentSerializer
from apps.permissions.permissions import AppointmentPermission


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [AppointmentPermission]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'ADMIN' or user.role == 'RECEPTIONIST':
            return Appointment.objects.all()

        if user.role == 'PROFESSIONAL':
            return Appointment.objects.filter(doctor__user=user)

        if user.role == 'PATIENT':
            return Appointment.objects.filter(patient__user=user)

        return Appointment.objects.none()