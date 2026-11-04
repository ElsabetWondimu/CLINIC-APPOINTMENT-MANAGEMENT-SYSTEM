import uuid

from django.conf import settings
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone


class Patient(models.Model):

    class Gender(models.TextChoices):
        MALE = "MALE", "Male"
        FEMALE = "FEMALE", "Female"
        OTHER = "OTHER", "Other"

    patient_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="patient_profile",
    )

    date_of_birth = models.DateField()

    gender = models.CharField(
        max_length=10,
        choices=Gender.choices,
    )

    phone_number = models.CharField(max_length=20)

    address = models.TextField()

    emergency_contact_name = models.CharField(max_length=100)

    emergency_contact_phone = models.CharField(max_length=20)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        if self.date_of_birth and self.date_of_birth > timezone.localdate():
            raise ValidationError({
                'date_of_birth': 'Date of birth cannot be in the future.'
            })

    def __str__(self):
        return f"{self.user.username} - {self.patient_id}"