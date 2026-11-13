# 🏥 ApexCare — Clinic Appointment Management System

> **Award-Winning Full-Stack Healthcare Platform**  
> Built with **Django REST Framework (DRF)** on the backend and an ultra-modern, responsive **Clinical Single-Page Application (SPA)** on the frontend.

---

## 🌟 Overview & Competition Highlights

ApexCare is an enterprise-grade clinical management system designed for medical practices, multi-specialty clinics, and outpatient healthcare networks.

- **100% Backend Integrity Preserved**: All original backend apps (`apps.users`, `apps.doctors`, `apps.patients`, `apps.appointments`, `apps.permissions`) and configurations remain pristine and untouched.
- **Top 5 Competition Ready**: Feature-packed with 4 distinct user persona workspaces, real-time interactive scheduling, conflict prevention, dynamic SVG analytics charts, official printable passes, and iCalendar (.ics) integration.
- **Dual Operating Modes**:
  1. **Live Django REST API Mode**: Fully synchronized with your Django server via Token Authentication (`Authorization: Token <token>`).
  2. **Interactive Presentation / Showcase Mode**: Seamless local-storage presentation mode preloaded with realistic clinical data so judges can evaluate the entire system even without starting the backend database.

---

## 👥 4 Specialized Role-Based Portals

ApexCare provides distinct, tailored workflows for every participant in the clinical care continuum:

### 1. 🧑 Patient Portal
- **Interactive 5-Step Booking Wizard**:
  - Step 1: Select medical department / specialty (Cardiology, Pediatrics, Dermatology, Orthopedics, etc.).
  - Step 2: Choose attending physician with experience, rating, credentials, and consultation fee.
  - Step 3: Calendar date picker + Interactive time slots (morning, afternoon, evening) with automatic double-booking collision prevention.
  - Step 4: Medical intake notes with rapid symptom chips (Checkup, Fever, Prescription, Follow-up).
  - Step 5: Summary review and instant reservation confirmation.
- **My Consultations Hub**: Filter appointments by status (`SCHEDULED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`).
- **One-Click Calendar Export**: Download standard `.ics` calendar invites for Apple Calendar, Google Calendar, and Outlook.
- **Digital Medical Pass**: Print an official clinic appointment pass with verification codes and clinic instructions.
- **Patient Profile & Emergency Contacts**: Track date of birth, emergency contacts, blood group, and address.

### 2. 🩺 Healthcare Professional (Doctor) Workspace
- **Clinic Duty Status Switch**: Real-time toggle to mark physician as **Available / On Duty** or **Away / In Surgery** (directly synchronizes `is_available`).
- **Today's Patient Schedule Timeline**: View arrival times, patient details, and symptoms for today.
- **Clinical Action Center**:
  - One-click visit completion (`COMPLETED`).
  - Confirm waiting patients (`CONFIRMED`).
  - Add & edit private medical consultation notes and prescription records.
- **Practice Revenue & KPI Tracker**: Live tracking of completed consultations and generated practice revenue.

### 3. 👩‍💼 Reception Staff Central Command
- **Front Desk Arrival Queue**: Live queue of patients arriving at the clinic today.
- **Rapid Check-In**: One-click check-in for arriving patients with copay verification notes.
- **Walk-in & Phone Booking Assistant**: Fast-track booking on behalf of walk-in patients.
- **Doctor Availability Board**: Comprehensive grid showing real-time on-duty status of every physician in the facility.

### 4. 👑 Executive Director (Admin) Suite
- **Clinic Intelligence KPIs**: Total appointments, active patients, doctors on duty, visit completion rate (%), and total clinical revenue.
- **Visual Analytics Charts**:
  - **Weekly Patient Inflow**: Dynamic SVG bar chart with day-by-day distribution.
  - **Department Specialty Share**: Multi-color SVG donut chart illustrating appointment distribution across specialties.
- **User Accounts Master View**: Audit all system users, email addresses, and roles (`ADMIN`, `RECEPTIONIST`, `PROFESSIONAL`, `PATIENT`).
- **Patient Database & CSV Export**: Searchable patient directory with a one-click **Export to CSV** feature for hospital records.

---

## ⚡ Quick Start Guide

### Option A: Complete System Launch (Windows)
Double-click `start_all.bat` or run:
```bat
start_all.bat
```
This automatically migrates the database, seeds demo doctors/patients/appointments, and launches both the backend and frontend.

---

### Option B: Complete System Launch (macOS / Linux)
Run:
```bash
chmod +x start_all.sh
./start_all.sh
```

---

### Option C: Manual Setup

#### 1. Backend Setup
```bash
# 1. Apply database migrations
python manage.py migrate

# 2. Seed realistic demo data (Doctors, Patients, Appointments, Accounts)
python seed_data.py

# 3. Start Django development server
python manage.py runserver 127.0.0.1:8000
```
Backend API will be live at `http://127.0.0.1:8000/api`.

#### 2. Frontend Launch
You can run the frontend in any of the following ways:

- **Using the included zero-dependency Python runner**:
  ```bash
  python run_frontend.py 3000
  ```
- **Using modern Vite (if Node.js is installed)**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
- **Direct Browser Inspection**:
  Simply open `frontend/index.html` in Chrome, Edge, Safari, or Firefox!

---

## 🔑 Demo Evaluation Credentials

The `seed_data.py` script provisions these accounts:

| Role | Username | Password | Full Name / Title | Specialty / Focus |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | Dr. Alexander Wright | Clinic Executive Director |
| **Receptionist** | `receptionist` | `reception123` | Sarah Jenkins | Front Desk Operations |
| **Doctor** | `dr.sarah` | `doctor123` | Dr. Sarah Mitchell, MD | Cardiology ($150/visit) |
| **Doctor** | `dr.marcus` | `doctor123` | Dr. Marcus Vance, MD | Pediatrics ($95/visit) |
| **Doctor** | `dr.elena` | `doctor123` | Dr. Elena Rostova, MD | Dermatology ($120/visit) |
| **Doctor** | `dr.chen` | `doctor123` | Dr. David Chen, MD | Orthopedic Surgery ($160/visit) |
| **Patient** | `patient.john` | `patient123` | John Doe | General Outpatient |
| **Patient** | `patient.clara` | `patient123` | Clara Oswald | General Outpatient |

> **Pro-Tip for Judges**: In the top navigation bar, use the **Persona Switcher** pills (`Patient`, `Doctor`, `Reception`, `Admin`) to toggle between roles with zero typing!

---

## 📡 Backend API Endpoints Map

All backend endpoints are built using Django REST Framework:

| Method | Endpoint | Description | Permissions |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/token/` | Obtain DRF Auth Token | Public |
| `POST` | `/api/users/` | Register new Patient | Public (`AllowAny`) |
| `GET` | `/api/users/` | List all users | `IsAdmin` |
| `GET` | `/api/doctors/` | List doctors | Filtered by role |
| `PATCH` | `/api/doctors/{id}/` | Update availability / info | Admin, Receptionist, Doctor (own profile) |
| `GET` | `/api/patients/` | List patients | Admin, Receptionist, Patient (own record) |
| `GET` | `/api/appointments/` | List appointments | Filtered by role |
| `POST` | `/api/appointments/` | Create appointment | Admin, Receptionist, Patient |
| `PATCH` | `/api/appointments/{id}/` | Update status / notes | Admin, Receptionist, Doctor |

---

## 🎨 Design & Technology Specifications

- **Design System**: HealthTech Modern (Teal, Medical Cyan, Dark Slate, Clean White)
- **Glassmorphism**: Backdrop blur with multi-layered subtle shadows
- **Interactive Charts**: Lightweight, responsive SVG vector graphics (Bar & Donut)
- **Audio Feedback**: Subtle Web Audio API synthesis for booking and status interactions
- **Theme**: Dark and Light modes with persistent state
- **Accessibility**: Tabular numbers for clinical times and fees, high contrast labels, semantic HTML5

---

## 🏆 Project Structure

```
CLINIC-APPOINTMENT-MANAGEMENT-SYSTEM/
├── apps/                         # Untouched Django applications
│   ├── appointments/             # Appointment models, serializers, views, permissions
│   ├── doctors/                  # Doctor profiles and availability
│   ├── patients/                 # Patient records and medical demographics
│   ├── permissions/              # Custom RBAC permissions
│   └── users/                    # Custom User model and registration
├── config/                       # Untouched Django configuration (settings, urls, wsgi)
├── frontend/                     # Award-Winning Single-Page Application (SPA)
│   ├── index.html                # Main application entry point
│   ├── package.json              # NPM configuration
│   ├── vite.config.js            # Vite build & proxy config
│   ├── css/
│   │   └── app.css               # Design system, glassmorphism, print pass styles
│   ├── js/
│   │   ├── app.js                # Main orchestrator & global event bindings
│   │   ├── api.js                # DRF Token Auth REST API client
│   │   ├── store.js              # Central reactive store & state management
│   │   ├── mockData.js           # Pre-seeded clinical dataset for presentation mode
│   │   ├── components/           # Modular UI view components
│   │   │   ├── Navbar.js         # Top nav, persona switcher, connection status
│   │   │   ├── Sidebar.js        # Dynamic role navigation & 24/7 hotline
│   │   │   ├── PatientDashboard.js # Patient booking & history
│   │   │   ├── DoctorDashboard.js  # Doctor schedule & patient timeline
│   │   │   ├── ReceptionDashboard.js # Front desk check-in queue & duty board
│   │   │   ├── AdminDashboard.js   # Executive analytics & charts
│   │   │   ├── BookingModal.js   # 5-step booking wizard with collision checks
│   │   │   ├── AppointmentDetailModal.js # View/update appointment & notes
│   │   │   ├── AuthModal.js      # DRF login & patient registration
│   │   │   ├── ApiSettingsModal.js # Backend diagnostic & ping tester
│   │   │   └── Toast.js          # Floating toast notification system
│   │   └── utils/
│   │       ├── formatters.js     # Currency, dates, status badges, audio synth
│   │       ├── calendar.js       # .ics generator & official printable pass
│   │       └── charts.js         # SVG Bar and Donut chart generators
│   └── assets/                   # Clinical icons and assets
├── manage.py                     # Untouched Django manage entrypoint
├── seed_data.py                  # Database seeder with realistic demo data
├── run_frontend.py               # Lightweight zero-dependency frontend runner
├── start_all.bat                 # 1-click Windows launcher
├── start_all.sh                  # 1-click Unix/macOS launcher
└── README.md                     # Comprehensive documentation
```
