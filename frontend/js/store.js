/**
 * Reactive Central State Store for Clinic Management System
 */

import { api } from './api.js';
import { MOCK_USERS, MOCK_DOCTORS, MOCK_PATIENTS } from './mockData.js';
import { playAudioFeedback } from './utils/formatters.js';

class Store {
  constructor() {
    this.listeners = new Set();
    
    // Default initial persona: Dr. Sarah Mitchell (PROFESSIONAL) or John Doe (PATIENT) or Admin
    const savedRole = localStorage.getItem('apex_active_role') || 'PATIENT';
    const savedTheme = localStorage.getItem('apex_theme') || 'light';

    this.state = {
      theme: savedTheme,
      currentRole: savedRole,
      currentUser: this.getDefaultUserForRole(savedRole),
      activeTab: 'overview',
      
      doctors: [],
      patients: [],
      appointments: [],
      users: [],
      
      filters: {
        status: 'ALL',
        searchQuery: '',
        date: '',
        specialty: 'all',
        doctorId: 'all',
      },

      selectedAppointment: null,
      selectedDoctor: null,
      
      modals: {
        booking: false,
        detail: false,
        auth: false,
        authMode: 'login', // 'login' | 'register'
        apiSettings: false,
        patientDirectory: false,
      },

      backendStatus: {
        online: false,
        checked: false,
        liveMode: api.isLiveMode,
      },

      stats: {
        totalAppointments: 0,
        scheduledCount: 0,
        confirmedCount: 0,
        completedCount: 0,
        cancelledCount: 0,
        totalRevenue: 0,
      },
      
      toasts: [],
    };
  }

  getDefaultUserForRole(role) {
    switch (role) {
      case 'ADMIN':
        return MOCK_USERS.find(u => u.role === 'ADMIN') || MOCK_USERS[0];
      case 'RECEPTIONIST':
        return MOCK_USERS.find(u => u.role === 'RECEPTIONIST') || MOCK_USERS[1];
      case 'PROFESSIONAL':
        return MOCK_USERS.find(u => u.role === 'PROFESSIONAL') || MOCK_USERS[2];
      case 'PATIENT':
      default:
        return MOCK_USERS.find(u => u.role === 'PATIENT') || MOCK_USERS[6];
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.recomputeStats();
    this.listeners.forEach(cb => {
      try {
        cb(this.state);
      } catch (e) {
        console.error('Store listener error:', e);
      }
    });
  }

  async init() {
    // Check backend health
    const health = await api.pingBackend();
    this.state.backendStatus = {
      online: health.online,
      checked: true,
      liveMode: api.isLiveMode,
    };

    // Load data
    await this.refreshData();
    this.applyTheme(this.state.theme);
  }

  async refreshData() {
    try {
      const [doctors, patients, appointments, users] = await Promise.all([
        api.getDoctors(),
        api.getPatients(),
        api.getAppointments(),
        api.getUsers(),
      ]);

      this.state.doctors = doctors;
      this.state.patients = patients;
      this.state.appointments = appointments;
      this.state.users = users;

      this.notify();
    } catch (err) {
      console.error('Failed to load store data:', err);
      this.addToast('Error refreshing data from server', 'error');
    }
  }

  recomputeStats() {
    const appts = this.state.appointments || [];
    let scheduled = 0;
    let confirmed = 0;
    let completed = 0;
    let cancelled = 0;
    let revenue = 0;

    appts.forEach(a => {
      const status = (a.status || '').toUpperCase();
      if (status === 'SCHEDULED') scheduled++;
      else if (status === 'CONFIRMED') confirmed++;
      else if (status === 'COMPLETED') {
        completed++;
        // find doctor fee
        const doc = this.state.doctors.find(d => d.doctor_id === a.doctor);
        if (doc) revenue += parseFloat(doc.consultation_fee || 0);
      } else if (status === 'CANCELLED') cancelled++;
    });

    this.state.stats = {
      totalAppointments: appts.length,
      scheduledCount: scheduled,
      confirmedCount: confirmed,
      completedCount: completed,
      cancelledCount: cancelled,
      totalRevenue: revenue,
    };
  }

  // --- Persona Switcher ---
  switchRole(newRole) {
    playAudioFeedback('click');
    this.state.currentRole = newRole;
    this.state.currentUser = this.getDefaultUserForRole(newRole);
    localStorage.setItem('apex_active_role', newRole);
    this.state.activeTab = 'overview';
    this.state.filters = {
      status: 'ALL',
      searchQuery: '',
      date: '',
      specialty: 'all',
      doctorId: 'all',
    };

    const roleNames = {
      ADMIN: 'Dr. Alexander Wright (Administrator)',
      RECEPTIONIST: 'Sarah Jenkins (Reception Desk)',
      PROFESSIONAL: 'Dr. Sarah Mitchell, MD (Cardiologist)',
      PATIENT: 'John Doe (Patient)',
    };

    this.addToast(`Switched active view to: ${roleNames[newRole]}`, 'info');
    this.notify();
  }

  setActiveTab(tab) {
    this.state.activeTab = tab;
    this.notify();
  }

  setFilter(key, value) {
    this.state.filters[key] = value;
    this.notify();
  }

  resetFilters() {
    this.state.filters = {
      status: 'ALL',
      searchQuery: '',
      date: '',
      specialty: 'all',
      doctorId: 'all',
    };
    this.notify();
  }

  // --- Modal Helpers ---
  openBookingModal(preselectedDoctor = null) {
    playAudioFeedback('click');
    this.state.selectedDoctor = preselectedDoctor;
    this.state.modals.booking = true;
    this.notify();
  }

  closeBookingModal() {
    this.state.modals.booking = false;
    this.state.selectedDoctor = null;
    this.notify();
  }

  openDetailModal(appointment) {
    playAudioFeedback('click');
    this.state.selectedAppointment = appointment;
    this.state.modals.detail = true;
    this.notify();
  }

  closeDetailModal() {
    this.state.modals.detail = false;
    this.state.selectedAppointment = null;
    this.notify();
  }

  openAuthModal(mode = 'login') {
    this.state.modals.authMode = mode;
    this.state.modals.auth = true;
    this.notify();
  }

  closeAuthModal() {
    this.state.modals.auth = false;
    this.notify();
  }

  openApiSettingsModal() {
    this.state.modals.apiSettings = true;
    this.notify();
  }

  closeApiSettingsModal() {
    this.state.modals.apiSettings = false;
    this.notify();
  }

  // --- Theme ---
  toggleTheme() {
    const next = this.state.theme === 'dark' ? 'light' : 'dark';
    this.state.theme = next;
    localStorage.setItem('apex_theme', next);
    this.applyTheme(next);
    this.notify();
  }

  applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  // --- Toast Notifications ---
  addToast(message, type = 'success', duration = 3500) {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substr(2, 4);
    const toast = { id, message, type };
    this.state.toasts.push(toast);
    this.notify();

    if (type === 'success') {
      playAudioFeedback('success');
    }

    setTimeout(() => {
      this.removeToast(id);
    }, duration);
  }

  removeToast(id) {
    this.state.toasts = this.state.toasts.filter(t => t.id !== id);
    this.notify();
  }
}

export const store = new Store();
