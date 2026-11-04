from rest_framework import serializers
from django.db import transaction

from .models import User
from apps.patients.models import Patient


class UserSerializer(serializers.ModelSerializer):

    date_of_birth = serializers.DateField(write_only=True)
    gender = serializers.ChoiceField(
        choices=Patient.Gender.choices,
        write_only=True
    )
    phone_number = serializers.CharField(write_only=True)
    address = serializers.CharField(write_only=True)
    emergency_contact_name = serializers.CharField(write_only=True)
    emergency_contact_phone = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'password',
            'date_of_birth',
            'gender',
            'phone_number',
            'address',
            'emergency_contact_name',
            'emergency_contact_phone',
        ]

        read_only_fields = ['id', 'role']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    @transaction.atomic
    def create(self, validated_data):
        patient_data = {
            'date_of_birth': validated_data.pop('date_of_birth'),
            'gender': validated_data.pop('gender'),
            'phone_number': validated_data.pop('phone_number'),
            'address': validated_data.pop('address'),
            'emergency_contact_name': validated_data.pop(
                'emergency_contact_name'
            ),
            'emergency_contact_phone': validated_data.pop(
                'emergency_contact_phone'
            ),
        }

        user = User.objects.create_user(
            **validated_data,
            role=User.Role.PATIENT
        )

        Patient.objects.create(
            user=user,
            **patient_data
        )

        return user