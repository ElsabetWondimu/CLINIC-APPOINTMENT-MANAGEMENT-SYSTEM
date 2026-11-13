/**
 * Django REST Framework API Client
 * Compatible with backend endpoints:
 * - /api/token/
 * - /api/users/
 * - /api/doctors/
 * - /api/patients/
 * - /api/appointments/
 */

import { MOCK_DOCTORS, MOCK_PATIENTS, MOCK_APPOINTMENTS, MOCK_USERS } from './mockData.js';

class ApiService {
  constructor() {
    this.baseUrl = localStorage.getItem('apex_api_url') || 'http://127.0.0.1:8000/api';
    this.token = localStorage.getItem('apex_auth_token') || null;
    this.isLiveMode = localStorage.getItem('apex_live_mode') === 'true';
    this.isBackendOnline = false;
    this.lastPingTime = null;

    // Initialize local storage copy of mock data if empty
    this.initLocalStore();
  }

  initLocalStore() {
    if (!localStorage.getItem('apex_db_appointments')) {
      localStorage.setItem('apex_db_appointments', JSON.stringify(MOCK_APPOINTMENTS));
    }
    if (!localStorage.getItem('apex_db_doctors')) {
      localStorage.setItem('apex_db_doctors', JSON.stringify(MOCK_DOCTORS));
    }
    if (!localStorage.getItem('apex_db_patients')) {
      localStorage.setItem('apex_db_patients', JSON.stringify(MOCK_PATIENTS));
    }
    if (!localStorage.getItem('apex_db_users')) {
      localStorage.setItem('apex_db_users', JSON.stringify(MOCK_USERS));
    }
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('apex_auth_token', token);
    } else {
      localStorage.removeItem('apex_auth_token');
    }
  }

  setBaseUrl(url) {
    this.baseUrl = url.replace(/\/+$/, '');
    localStorage.setItem('apex_api_url', this.baseUrl);
  }

  setLiveMode(enabled) {
    this.isLiveMode = enabled;
    localStorage.setItem('apex_live_mode', enabled ? 'true' : 'false');
  }

  getHeaders(extraHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...extraHeaders,
    };
    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`;
    }
    return headers;
  }

  async pingBackend() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${this.baseUrl}/users/`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      // Even a 401/403 means Django is up and responding!
      this.isBackendOnline = res.status < 500;
      this.lastPingTime = new Date();
      return { online: this.isBackendOnline, status: res.status };
    } catch (e) {
      this.isBackendOnline = false;
      this.lastPingTime = new Date();
      return { online: false, error: e.message };
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    const config = {
      ...options,
      headers: this.getHeaders(options.headers),
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const isJson = (response.headers.get('content-type') || '').includes('application/json');
      const data = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        const error = new Error(data?.detail || data?.message || `HTTP ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }
      return data;
    } catch (err) {
      throw err;
    }
  }

  // --- Authentication ---
  async login(username, password) {
    if (this.isLiveMode) {
      try {
        const res = await this.request('/token/', {
          method: 'POST',
          body: { username, password },
        });
        if (res && res.token) {
          this.setToken(res.token);
          return { success: true, token: res.token, username };
        }
      } catch (err) {
        throw new Error(err.data?.non_field_errors?.[0] || 'Unable to log in with provided credentials.');
      }
    }

    // Demo Mode fallback authentication
    const users = JSON.parse(localStorage.getItem('apex_db_users') || '[]');
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
      const demoToken = 'demo-token-' + btoa(username) + '-' + Date.now();
      this.setToken(demoToken);
      return { success: true, token: demoToken, user };
    }
    // Generic demo success if password matches demo rule
    if (username) {
      const demoToken = 'demo-token-' + btoa(username);
      this.setToken(demoToken);
      return {
        success: true,
        token: demoToken,
        user: { username, role: 'PATIENT', first_name: username, last_name: '' },
      };
    }
    throw new Error('Invalid username or password.');
  }

  // --- User Registration (Patient) ---
  async register(registrationData) {
    if (this.isLiveMode) {
      return await this.request('/users/', {
        method: 'POST',
        body: registrationData,
      });
    }

    // Local / Demo registration
    const users = JSON.parse(localStorage.getItem('apex_db_users') || '[]');
    const patients = JSON.parse(localStorage.getItem('apex_db_patients') || '[]');

    if (users.some(u => u.username === registrationData.username)) {
      throw new Error('A user with that username already exists.');
    }

    const newUserId = users.length + 100;
    const newUser = {
      id: newUserId,
      username: registrationData.username,
      email: registrationData.email || `${registrationData.username}@example.com`,
      first_name: registrationData.first_name || '',
      last_name: registrationData.last_name || '',
      role: 'PATIENT',
    };

    const newPatient = {
      patient_id: 'p' + Math.random().toString(36).substring(2, 9) + '-demo',
      user: newUserId,
      user_details: newUser,
      name: `${registrationData.first_name} ${registrationData.last_name}`.trim() || registrationData.username,
      date_of_birth: registrationData.date_of_birth,
      gender: registrationData.gender,
      phone_number: registrationData.phone_number,
      address: registrationData.address,
      emergency_contact_name: registrationData.emergency_contact_name,
      emergency_contact_phone: registrationData.emergency_contact_phone,
    };

    users.push(newUser);
    patients.push(newPatient);
    localStorage.setItem('apex_db_users', JSON.stringify(users));
    localStorage.setItem('apex_db_patients', JSON.stringify(patients));

    return newUser;
  }

  // --- Doctors ---
  async getDoctors() {
    if (this.isLiveMode) {
      try {
        return await this.request('/doctors/');
      } catch (e) {
        console.warn('API error, falling back to local doctors store', e);
      }
    }
    return JSON.parse(localStorage.getItem('apex_db_doctors') || '[]');
  }

  async updateDoctor(doctorId, data) {
    if (this.isLiveMode) {
      return await this.request(`/doctors/${doctorId}/`, {
        method: 'PATCH',
        body: data,
      });
    }
    const doctors = JSON.parse(localStorage.getItem('apex_db_doctors') || '[]');
    const index = doctors.findIndex(d => d.doctor_id === doctorId);
    if (index !== -1) {
      doctors[index] = { ...doctors[index], ...data };
      localStorage.setItem('apex_db_doctors', JSON.stringify(doctors));
      return doctors[index];
    }
    throw new Error('Doctor not found');
  }

  // --- Patients ---
  async getPatients() {
    if (this.isLiveMode) {
      try {
        return await this.request('/patients/');
      } catch (e) {
        console.warn('API error, falling back to local patients store', e);
      }
    }
    return JSON.parse(localStorage.getItem('apex_db_patients') || '[]');
  }

  // --- Appointments ---
  async getAppointments() {
    if (this.isLiveMode) {
      try {
        return await this.request('/appointments/');
      } catch (e) {
        console.warn('API error, falling back to local appointments store', e);
      }
    }
    return JSON.parse(localStorage.getItem('apex_db_appointments') || '[]');
  }

  async createAppointment(appointmentData) {
    if (this.isLiveMode) {
      return await this.request('/appointments/', {
        method: 'POST',
        body: appointmentData,
      });
    }

    const appointments = JSON.parse(localStorage.getItem('apex_db_appointments') || '[]');
    
    // Check double booking for doctor
    const conflict = appointments.find(
      a =>
        a.doctor === appointmentData.doctor &&
        a.appointment_date === appointmentData.appointment_date &&
        a.appointment_time === appointmentData.appointment_time &&
        a.status !== 'CANCELLED'
    );
    if (conflict) {
      throw new Error('This doctor already has an appointment at this time.');
    }

    const newAppt = {
      appointment_id: 'a' + Math.random().toString(36).substring(2, 9) + '-demo',
      patient: appointmentData.patient,
      doctor: appointmentData.doctor,
      appointment_date: appointmentData.appointment_date,
      appointment_time: appointmentData.appointment_time,
      reason: appointmentData.reason,
      status: appointmentData.status || 'SCHEDULED',
      notes: appointmentData.notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    appointments.unshift(newAppt);
    localStorage.setItem('apex_db_appointments', JSON.stringify(appointments));
    return newAppt;
  }

  async updateAppointment(appointmentId, updates) {
    if (this.isLiveMode) {
      return await this.request(`/appointments/${appointmentId}/`, {
        method: 'PATCH',
        body: updates,
      });
    }

    const appointments = JSON.parse(localStorage.getItem('apex_db_appointments') || '[]');
    const index = appointments.findIndex(a => a.appointment_id === appointmentId);
    if (index !== -1) {
      appointments[index] = {
        ...appointments[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem('apex_db_appointments', JSON.stringify(appointments));
      return appointments[index];
    }
    throw new Error('Appointment not found');
  }

  async cancelAppointment(appointmentId) {
    return this.updateAppointment(appointmentId, { status: 'CANCELLED' });
  }

  // --- Users (Admin) ---
  async getUsers() {
    if (this.isLiveMode) {
      try {
        return await this.request('/users/');
      } catch (e) {
        console.warn('API error, falling back to local users store', e);
      }
    }
    return JSON.parse(localStorage.getItem('apex_db_users') || '[]');
  }
}

export const api = new ApiService();
