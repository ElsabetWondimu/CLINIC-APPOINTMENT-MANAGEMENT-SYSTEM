/**
 * ApexCare Clinic Appointment Management System
 * Main Application Orchestrator & Component Mount
 */

import { store } from './store.js';
import { api } from './api.js';
import { renderNavbar } from './components/Navbar.js';
import { renderSidebar } from './components/Sidebar.js';
import { renderPatientDashboard } from './components/PatientDashboard.js';
import { renderDoctorDashboard } from './components/DoctorDashboard.js';
import { renderReceptionDashboard } from './components/ReceptionDashboard.js';
import { renderAdminDashboard } from './components/AdminDashboard.js';
import { renderBookingModal, updateTimeSlots } from './components/BookingModal.js';
import { renderAppointmentDetailModal } from './components/AppointmentDetailModal.js';
import { renderAuthModal } from './components/AuthModal.js';
import { renderApiSettingsModal } from './components/ApiSettingsModal.js';
import { renderToasts } from './components/Toast.js';
import { downloadIcsFile, printAppointmentPass } from './utils/calendar.js';

// Expose Store globally for event handlers
window.ApexStore = store;

// --- Global UI Event Handlers ---

window.ApexBookingDocChange = (docId) => {
  const doc = store.state.doctors.find(d => d.doctor_id === docId);
  const feeEl = document.getElementById('booking-fee-display');
  if (feeEl && doc) feeEl.textContent = `$${doc.consultation_fee}`;
  const dateInput = document.getElementById('booking-date');
  const dateVal = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
  updateTimeSlots(docId, dateVal);
};

window.ApexBookingDateChange = (dateVal) => {
  const docRadio = document.querySelector('input[name="booking_doctor"]:checked');
  const docId = docRadio ? docRadio.value : store.state.doctors[0]?.doctor_id;
  updateTimeSlots(docId, dateVal);
};

window.ApexSelectSlot = (inputEl) => {
  document.querySelectorAll('input[name="booking_time"]').forEach(el => {
    const parent = el.closest('label');
    if (parent) {
      parent.classList.remove('border-teal-500', 'bg-teal-50', 'dark:bg-teal-950/40', 'ring-2', 'ring-teal-500/20');
      parent.classList.add('border-slate-200', 'dark:border-slate-700');
    }
  });
  const parent = inputEl.closest('label');
  if (parent) {
    parent.classList.remove('border-slate-200', 'dark:border-slate-700');
    parent.classList.add('border-teal-500', 'bg-teal-50', 'dark:bg-teal-950/40', 'ring-2', 'ring-teal-500/20');
  }
};

window.ApexAppendReason = (chipText) => {
  const textarea = document.getElementById('booking-reason');
  if (textarea) {
    if (textarea.value.trim() === 'Routine comprehensive health checkup and consultation.') {
      textarea.value = chipText;
    } else if (!textarea.value.includes(chipText)) {
      textarea.value = (textarea.value.trim() + ' • ' + chipText).trim();
    }
    textarea.focus();
  }
};

window.ApexSubmitBooking = async () => {
  const form = document.getElementById('booking-wizard-form');
  if (!form) return;

  const docRadio = form.querySelector('input[name="booking_doctor"]:checked');
  const timeRadio = form.querySelector('input[name="booking_time"]:checked');
  const dateInput = form.querySelector('input[name="appointment_date"]');
  const reasonInput = form.querySelector('textarea[name="reason"]');

  if (!docRadio) {
    store.addToast('Please select a specialist doctor.', 'error');
    return;
  }
  if (!timeRadio) {
    store.addToast('Please select an available time slot.', 'error');
    return;
  }
  if (!dateInput || !dateInput.value) {
    store.addToast('Please select an appointment date.', 'error');
    return;
  }
  if (!reasonInput || !reasonInput.value.trim()) {
    store.addToast('Please provide a reason or symptom summary.', 'error');
    return;
  }

  const { currentUser, patients } = store.state;
  const currentPatient = patients.find(p => p.user === currentUser?.id) || patients[0];

  const payload = {
    doctor: docRadio.value,
    patient: currentPatient?.patient_id || currentPatient?.id,
    appointment_date: dateInput.value,
    appointment_time: timeRadio.value,
    reason: reasonInput.value.trim(),
    status: 'SCHEDULED',
    notes: '',
  };

  const submitBtn = document.getElementById('submit-booking-btn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Securing Slot...';
  }

  try {
    const created = await api.createAppointment(payload);
    await store.refreshData();
    store.closeBookingModal();
    store.addToast('Appointment successfully scheduled! 🩺', 'success');

    // Offer to print pass or calendar
    setTimeout(() => {
      window.ApexPassHandler(created.appointment_id);
    }, 400);
  } catch (err) {
    console.error('Booking failed:', err);
    store.addToast(err.message || 'Failed to book appointment', 'error');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Confirm & Reserve Visit 🩺';
    }
  }
};

window.ApexCancelHandler = async (apptId) => {
  if (!confirm('Are you sure you want to cancel this appointment?')) return;
  try {
    await api.cancelAppointment(apptId);
    await store.refreshData();
    store.closeDetailModal();
    store.addToast('Appointment has been cancelled.', 'info');
  } catch (err) {
    store.addToast(err.message || 'Could not cancel appointment', 'error');
  }
};

window.ApexPassHandler = (apptId) => {
  const appt = store.state.appointments.find(a => a.appointment_id === apptId);
  if (!appt) return;
  const doc = store.state.doctors.find(d => d.doctor_id === appt.doctor);
  const patient = store.state.patients.find(p => p.patient_id === appt.patient);
  printAppointmentPass(appt, doc, patient);
};

window.ApexCalendarHandler = (apptId) => {
  const appt = store.state.appointments.find(a => a.appointment_id === apptId);
  if (!appt) return;
  const doc = store.state.doctors.find(d => d.doctor_id === appt.doctor);
  const patient = store.state.patients.find(p => p.patient_id === appt.patient);
  downloadIcsFile(
    appt,
    doc?.name || 'Physician',
    patient?.name || 'Patient'
  );
  store.addToast('Downloaded .ics calendar invite! 📅', 'success');
};

window.ApexUpdateStatus = async (apptId, newStatus) => {
  try {
    await api.updateAppointment(apptId, { status: newStatus });
    await store.refreshData();
    store.addToast(`Appointment status updated to ${newStatus}`, 'success');
  } catch (err) {
    store.addToast(err.message || 'Failed to update status', 'error');
  }
};

window.ApexToggleDoctorAvailability = async (doctorId) => {
  const doc = store.state.doctors.find(d => d.doctor_id === doctorId);
  if (!doc) return;
  const nextStatus = !doc.is_available;
  try {
    await api.updateDoctor(doctorId, { is_available: nextStatus });
    await store.refreshData();
    store.addToast(`Dr. availability updated to: ${nextStatus ? 'Available / On Duty' : 'Away / In Surgery'}`, 'info');
  } catch (err) {
    store.addToast('Could not update doctor availability', 'error');
  }
};

window.ApexSaveDetailUpdates = async (overrideStatus = null) => {
  const appt = store.state.selectedAppointment;
  if (!appt) return;
  const notesEl = document.getElementById('detail-modal-notes');
  const updates = {};
  if (notesEl) updates.notes = notesEl.value.trim();
  if (overrideStatus) updates.status = overrideStatus;

  try {
    await api.updateAppointment(appt.appointment_id, updates);
    await store.refreshData();
    store.closeDetailModal();
    store.addToast('Appointment records saved.', 'success');
  } catch (err) {
    store.addToast(err.message || 'Error saving changes', 'error');
  }
};

window.ApexHandleLoginSubmit = async (e) => {
  e.preventDefault();
  const form = e.target;
  const username = form.username.value.trim();
  const password = form.password.value;

  try {
    const res = await api.login(username, password);
    store.closeAuthModal();
    store.addToast(`Authenticated as ${username}!`, 'success');
    
    // Automatically match role
    if (username === 'admin') store.switchRole('ADMIN');
    else if (username === 'receptionist') store.switchRole('RECEPTIONIST');
    else if (username.startsWith('dr.')) store.switchRole('PROFESSIONAL');
    else store.switchRole('PATIENT');
  } catch (err) {
    store.addToast(err.message || 'Login failed', 'error');
  }
};

window.ApexFillAndLogin = (username) => {
  if (username === 'admin') store.switchRole('ADMIN');
  else if (username === 'receptionist') store.switchRole('RECEPTIONIST');
  else if (username.startsWith('dr.')) store.switchRole('PROFESSIONAL');
  else store.switchRole('PATIENT');
  store.closeAuthModal();
};

window.ApexHandleRegisterSubmit = async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  try {
    await api.register(data);
    await store.refreshData();
    store.closeAuthModal();
    store.switchRole('PATIENT');
    store.addToast(`Patient registered! Welcome, ${data.first_name || data.username}.`, 'success');
  } catch (err) {
    store.addToast(err.message || 'Registration failed', 'error');
  }
};

window.ApexPingBackend = async () => {
  const health = await api.pingBackend();
  store.state.backendStatus.online = health.online;
  store.notify();
  if (health.online) {
    store.addToast('Successfully connected to Django REST Framework backend! 🟢', 'success');
  } else {
    store.addToast('Django backend unreachable at configured URL. Using interactive presentation mode. 🟡', 'warning');
  }
};

window.ApexSetApiMode = (isLive) => {
  api.setLiveMode(isLive);
  store.state.backendStatus.liveMode = isLive;
  store.notify();
  store.addToast(`Switched to: ${isLive ? 'Live Django Backend API' : 'Interactive Demo Mode'}`, 'info');
};

window.ApexSaveApiUrl = () => {
  const input = document.getElementById('api-url-input');
  if (input && input.value.trim()) {
    api.setBaseUrl(input.value.trim());
    window.ApexPingBackend();
  }
};

window.ApexExportPatientsCsv = () => {
  const { patients } = store.state;
  if (!patients || patients.length === 0) {
    store.addToast('No patient records to export.', 'warning');
    return;
  }
  const headers = ['Patient ID', 'Name', 'DOB', 'Gender', 'Phone', 'Address', 'Emergency Name', 'Emergency Phone'];
  const rows = patients.map(p => [
    p.patient_id,
    p.name || p.user_details?.username,
    p.date_of_birth,
    p.gender,
    `"${p.phone_number}"`,
    `"${p.address}"`,
    `"${p.emergency_contact_name}"`,
    `"${p.emergency_contact_phone}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `ApexCare_Patients_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  store.addToast('Exported patient database to CSV! 📊', 'success');
};

// --- Application Mount & Render Cycle ---

function renderApp() {
  const navContainer = document.getElementById('navbar-root');
  const sidebarContainer = document.getElementById('sidebar-root');
  const mainContainer = document.getElementById('main-content-root');
  const modalsContainer = document.getElementById('modals-root');
  const toastsContainer = document.getElementById('toasts-root');

  renderNavbar(navContainer);
  renderSidebar(sidebarContainer);

  const { currentRole, activeTab } = store.state;

  if (mainContainer) {
    switch (currentRole) {
      case 'ADMIN':
        renderAdminDashboard(mainContainer);
        break;
      case 'RECEPTIONIST':
        renderReceptionDashboard(mainContainer);
        break;
      case 'PROFESSIONAL':
        renderDoctorDashboard(mainContainer);
        break;
      case 'PATIENT':
      default:
        renderPatientDashboard(mainContainer);
        break;
    }
  }

  if (modalsContainer) {
    modalsContainer.innerHTML = `
      <div id="booking-modal-mount"></div>
      <div id="detail-modal-mount"></div>
      <div id="auth-modal-mount"></div>
      <div id="api-modal-mount"></div>
    `;
    renderBookingModal(document.getElementById('booking-modal-mount'));
    renderAppointmentDetailModal(document.getElementById('detail-modal-mount'));
    renderAuthModal(document.getElementById('auth-modal-mount'));
    renderApiSettingsModal(document.getElementById('api-modal-mount'));
  }

  renderToasts(toastsContainer);
}

// Subscribe renderer to central store
store.subscribe(renderApp);

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  await store.init();
  renderApp();
});
