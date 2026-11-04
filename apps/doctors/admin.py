from django.contrib import admin
from .models import Doctor


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = (
        "doctor_id",
        "user",
        "specialty",
        "qualifications",
        "years_of_experience",
        "consultation_fee",
        "is_available",
    )

    search_fields = (
        "user__username",
        "user__first_name",
        "user__last_name",
        "specialty",
    )

    list_filter = ("specialty", "is_available")