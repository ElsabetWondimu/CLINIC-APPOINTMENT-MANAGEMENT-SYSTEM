from rest_framework import serializers
from django.utils import timezone
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = [
            'appointment_id',
            'created_at',
            'updated_at'
        ]

    def validate(self, data):
        user = self.context['request'].user

        doctor = data.get(
            'doctor',
            self.instance.doctor if self.instance else None
        )

        appointment_date = data.get(
            'appointment_date',
            self.instance.appointment_date if self.instance else None
        )

        appointment_time = data.get(
            'appointment_time',
            self.instance.appointment_time if self.instance else None
        )

        # Check patient ownership
        if user.role == 'PATIENT':
            patient = data.get(
                'patient',
                self.instance.patient if self.instance else None
            )

            if patient is None or patient.user != user:
                raise serializers.ValidationError(
                    "You can only book appointments for yourself."
                )

            data['status'] = 'SCHEDULED'
            data['notes'] = ''

        # Check doctor availability
        if doctor and not doctor.is_available:
            raise serializers.ValidationError(
                "This doctor is currently unavailable."
            )

        # Check appointment date and time
        if appointment_date and appointment_time:
            current_time = timezone.localtime()

            if appointment_date < current_time.date():
                raise serializers.ValidationError(
                    "You cannot book an appointment in the past."
                )

            if (
                appointment_date == current_time.date()
                and appointment_time <= current_time.time().replace(
                    tzinfo=None
                )
            ):
                raise serializers.ValidationError(
                    "Appointment time must be in the future."
                )

        # Prevent double booking
        if doctor and appointment_date and appointment_time:
            appointments = Appointment.objects.filter(
                doctor=doctor,
                appointment_date=appointment_date,
                appointment_time=appointment_time
            ).exclude(status='CANCELLED')

            if self.instance:
                appointments = appointments.exclude(
                    pk=self.instance.pk
                )

            if appointments.exists():
                raise serializers.ValidationError(
                    "This doctor already has an appointment at this time."
                )

        return data