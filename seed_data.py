"""
ApexCare Clinic Management System - Demo Database Seeder
Populates initial doctors, receptionists, patients, and appointments for local evaluation.

Run with:
    python manage.py migrate
    python seed_data.py
"""

import os
import sys
from datetime import date, time, timedelta

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

try:
    import django
    django.setup()
except Exception as e:
    print(f"Error setting up Django environment: {e}")
    sys.exit(1)

from apps.users.models import User
from apps.doctors.models import Doctor
from apps.patients.models import Patient
from apps.appointments.models import Appointment


def seed():
    print("🌱 Seeding ApexCare Clinic Management System database...\n")

    # 1. Administrator
    admin, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'director@apexcare.health',
            'first_name': 'Alexander',
            'last_name': 'Wright',
            'role': User.Role.ADMIN,
            'is_staff': True,
            'is_superuser': True,
        }
    )
    if created:
        admin.set_password('admin123')
        admin.save()
        print("  ✓ Created Admin: admin / admin123")
    else:
        print("  • Admin already exists")

    # 2. Receptionist Staff
    receptionist, created = User.objects.get_or_create(
        username='receptionist',
        defaults={
            'email': 'sarah.j@apexcare.health',
            'first_name': 'Sarah',
            'last_name': 'Jenkins',
            'role': User.Role.RECEPTIONIST,
        }
    )
    if created:
        receptionist.set_password('reception123')
        receptionist.save()
        print("  ✓ Created Receptionist: receptionist / reception123")
    else:
        print("  • Receptionist already exists")

    # 3. Healthcare Professionals (Doctors)
    doctors_info = [
        {
            'username': 'dr.sarah',
            'password': 'doctor123',
            'first_name': 'Sarah',
            'last_name': 'Mitchell',
            'email': 's.mitchell@apexcare.health',
            'specialty': 'Cardiology',
            'qualifications': 'MD, FACC, Harvard Medical School',
            'years_of_experience': 14,
            'phone_number': '+1 (555) 382-9011',
            'consultation_fee': 150.00,
            'is_available': True,
        },
        {
            'username': 'dr.marcus',
            'password': 'doctor123',
            'first_name': 'Marcus',
            'last_name': 'Vance',
            'email': 'm.vance@apexcare.health',
            'specialty': 'Pediatrics',
            'qualifications': 'MD, FAAP, Johns Hopkins Medicine',
            'years_of_experience': 11,
            'phone_number': '+1 (555) 491-2384',
            'consultation_fee': 95.00,
            'is_available': True,
        },
        {
            'username': 'dr.elena',
            'password': 'doctor123',
            'first_name': 'Elena',
            'last_name': 'Rostova',
            'email': 'e.rostova@apexcare.health',
            'specialty': 'Dermatology',
            'qualifications': 'MD, FAAD, Stanford Medicine',
            'years_of_experience': 9,
            'phone_number': '+1 (555) 782-4119',
            'consultation_fee': 120.00,
            'is_available': True,
        },
        {
            'username': 'dr.chen',
            'password': 'doctor123',
            'first_name': 'David',
            'last_name': 'Chen',
            'email': 'd.chen@apexcare.health',
            'specialty': 'Orthopedics',
            'qualifications': 'MD, FAAOS, Columbia University',
            'years_of_experience': 16,
            'phone_number': '+1 (555) 892-1200',
            'consultation_fee': 160.00,
            'is_available': False,
        },
    ]

    doctor_objects = []
    for d in doctors_info:
        user, u_created = User.objects.get_or_create(
            username=d['username'],
            defaults={
                'email': d['email'],
                'first_name': d['first_name'],
                'last_name': d['last_name'],
                'role': User.Role.PROFESSIONAL,
            }
        )
        if u_created:
            user.set_password(d['password'])
            user.save()

        doc, doc_created = Doctor.objects.get_or_create(
            user=user,
            defaults={
                'specialty': d['specialty'],
                'qualifications': d['qualifications'],
                'years_of_experience': d['years_of_experience'],
                'phone_number': d['phone_number'],
                'consultation_fee': d['consultation_fee'],
                'is_available': d['is_available'],
            }
        )
        doctor_objects.append(doc)
        if doc_created:
            print(f"  ✓ Created Doctor: Dr. {user.get_full_name()} ({d['specialty']})")
        else:
            print(f"  • Doctor {user.username} already exists")

    # 4. Patients
    patients_info = [
        {
            'username': 'patient.john',
            'password': 'patient123',
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john.doe@example.com',
            'date_of_birth': date(1992, 6, 15),
            'gender': Patient.Gender.MALE,
            'phone_number': '+1 (555) 234-5678',
            'address': '742 Evergreen Terrace, Springfield, OR',
            'emergency_contact_name': 'Jane Doe',
            'emergency_contact_phone': '+1 (555) 987-6543',
        },
        {
            'username': 'patient.clara',
            'password': 'patient123',
            'first_name': 'Clara',
            'last_name': 'Oswald',
            'email': 'clara.o@example.com',
            'date_of_birth': date(1995, 11, 23),
            'gender': Patient.Gender.FEMALE,
            'phone_number': '+1 (555) 345-6789',
            'address': '221B Baker Street, London, UK',
            'emergency_contact_name': 'Arthur Oswald',
            'emergency_contact_phone': '+1 (555) 876-5432',
        },
    ]

    patient_objects = []
    for p in patients_info:
        user, u_created = User.objects.get_or_create(
            username=p['username'],
            defaults={
                'email': p['email'],
                'first_name': p['first_name'],
                'last_name': p['last_name'],
                'role': User.Role.PATIENT,
            }
        )
        if u_created:
            user.set_password(p['password'])
            user.save()

        pat, pat_created = Patient.objects.get_or_create(
            user=user,
            defaults={
                'date_of_birth': p['date_of_birth'],
                'gender': p['gender'],
                'phone_number': p['phone_number'],
                'address': p['address'],
                'emergency_contact_name': p['emergency_contact_name'],
                'emergency_contact_phone': p['emergency_contact_phone'],
            }
        )
        patient_objects.append(pat)
        if pat_created:
            print(f"  ✓ Created Patient: {user.get_full_name()}")
        else:
            print(f"  • Patient {user.username} already exists")

    # 5. Initial Appointments
    today = date.today()
    sample_appts = [
        {
            'patient': patient_objects[0],
            'doctor': doctor_objects[0],
            'appointment_date': today,
            'appointment_time': time(10, 0),
            'reason': 'Routine cardiovascular checkup and mild shortness of breath after jogging.',
            'status': Appointment.Status.CONFIRMED,
            'notes': 'Patient requested ECG and blood pressure baseline check.',
        },
        {
            'patient': patient_objects[1],
            'doctor': doctor_objects[2],
            'appointment_date': today + timedelta(days=1),
            'appointment_time': time(14, 30),
            'reason': 'Follow-up for eczema treatment and allergic patch assessment.',
            'status': Appointment.Status.SCHEDULED,
            'notes': '',
        },
        {
            'patient': patient_objects[0],
            'doctor': doctor_objects[1],
            'appointment_date': today + timedelta(days=3),
            'appointment_time': time(11, 0),
            'reason': 'Annual pediatric developmental wellness visit for child.',
            'status': Appointment.Status.SCHEDULED,
            'notes': 'Bring previous vaccination records.',
        },
        {
            'patient': patient_objects[1],
            'doctor': doctor_objects[0],
            'appointment_date': today - timedelta(days=2),
            'appointment_time': time(9, 30),
            'reason': 'Post-hypertension follow-up and prescription refill.',
            'status': Appointment.Status.COMPLETED,
            'notes': 'BP stabilized at 122/78 mmHg on Lisinopril 10mg. Return in 6 months.',
        },
    ]

    for appt_data in sample_appts:
        appt, appt_created = Appointment.objects.get_or_create(
            doctor=appt_data['doctor'],
            appointment_date=appt_data['appointment_date'],
            appointment_time=appt_data['appointment_time'],
            defaults={
                'patient': appt_data['patient'],
                'reason': appt_data['reason'],
                'status': appt_data['status'],
                'notes': appt_data['notes'],
            }
        )
        if appt_created:
            print(f"  ✓ Created Appointment: {appt_data['patient'].user.username} with Dr. {appt_data['doctor'].user.username} on {appt_data['appointment_date']}")

    print("\n🎉 Seeding completed successfully!")
    print("\nAvailable Demo Credentials:")
    print("  • Administrator:    admin        / admin123")
    print("  • Receptionist:     receptionist / reception123")
    print("  • Cardiologist:     dr.sarah     / doctor123")
    print("  • Pediatrician:     dr.marcus    / doctor123")
    print("  • Dermatologist:    dr.elena     / doctor123")
    print("  • Patient:          patient.john / patient123")
    print("  • Patient:          patient.clara / patient123\n")


if __name__ == '__main__':
    seed()
