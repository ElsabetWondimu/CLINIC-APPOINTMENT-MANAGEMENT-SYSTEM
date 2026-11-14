from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework.authtoken.views import obtain_auth_token

def api_root_view(request):
    return JsonResponse({
        "status": "online",
        "message": "Welcome to the Clinic Appointment Management System API",
        "admin": "/admin/",
        "endpoints": {
            "token": "/api/token/",
            "users": "/api/users/",
            "patients": "/api/patients/",
            "doctors": "/api/doctors/",
            "appointments": "/api/appointments/"
        }
    })

urlpatterns = [
    path('', api_root_view, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/token/', obtain_auth_token),
    path('api/users/', include('apps.users.urls')),
    path('api/patients/', include('apps.patients.urls')),
    path('api/doctors/', include('apps.doctors.urls')),
    path('api/appointments/', include('apps.appointments.urls')),
]