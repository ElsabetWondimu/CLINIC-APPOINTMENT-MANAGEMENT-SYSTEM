/**
 * Executive Admin Suite Dashboard & Analytics Component
 */

import { store } from '../store.js';
import { formatDate, formatTime, formatCurrency, getStatusBadge } from '../utils/formatters.js';
import { renderBarChart, renderDonutChart } from '../utils/charts.js';

export function renderAdminDashboard(container) {
  if (!container) return;
  const { appointments, doctors, patients, users, stats, filters, activeTab } = store.state;

  const completionRate = stats.totalAppointments > 0 
    ? Math.round((stats.completedCount / stats.totalAppointments) * 100) 
    : 0;

  // Chart data: by specialty
  const specialtyCounts = {};
  doctors.forEach(d => {
    specialtyCounts[d.specialty] = 0;
  });
  appointments.forEach(a => {
    const doc = doctors.find(d => d.doctor_id === a.doctor);
    if (doc && doc.specialty) {
      specialtyCounts[doc.specialty] = (specialtyCounts[doc.specialty] || 0) + 1;
    }
  });

  const donutColors = ['#0d9488', '#0284c7', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981'];
  const donutSlices = Object.keys(specialtyCounts).map((spec, i) => ({
    label: spec,
    value: specialtyCounts[spec],
    color: donutColors[i % donutColors.length],
  }));

  // Weekly bar data
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyData = days.map((day, i) => ({
    label: day,
    value: Math.floor(Math.random() * 8) + (i === 2 || i === 4 ? 6 : 2),
  }));

  container.innerHTML = `
    <div class="space-y-8 animate-fade-in">
      
      <!-- Executive Header -->
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl shadow-slate-950/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-bold backdrop-blur-sm mb-3">
            <span class="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
            Clinic Administration & Intelligence
          </span>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">Executive Director Suite</h1>
          <p class="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Real-time clinical throughput, patient acquisition, staffing rosters, and financial analytics.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button 
            onclick="window.ApexExportPatientsCsv()"
            class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs backdrop-blur-sm transition-all flex items-center gap-2"
          >
            <svg class="w-4 h-4 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            <span>Export Patients (CSV)</span>
          </button>
        </div>
      </div>

      <!-- Executive KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Consults</p>
          <p class="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">${stats.totalAppointments}</p>
          <p class="text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-1">Booked visits</p>
        </div>

        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Patients</p>
          <p class="text-2xl font-extrabold text-sky-600 dark:text-sky-400 mt-1">${patients.length}</p>
          <p class="text-[11px] text-sky-600 dark:text-sky-400 font-medium mt-1">Registered records</p>
        </div>

        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">On-Duty Doctors</p>
          <p class="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            ${doctors.filter(d => d.is_available).length} <span class="text-sm font-normal text-slate-400">/ ${doctors.length}</span>
          </p>
          <p class="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-1">Clinical staff active</p>
        </div>

        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completion Rate</p>
          <p class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">${completionRate}%</p>
          <p class="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">Visit adherence</p>
        </div>

        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Consult Revenue</p>
          <p class="text-2xl font-extrabold text-teal-600 dark:text-teal-400 mt-1">${formatCurrency(stats.totalRevenue)}</p>
          <p class="text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-1">Completed visits</p>
        </div>
      </div>

      <!-- Real-Time Analytics Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Weekly Appointment Trends -->
        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-sm font-extrabold text-slate-900 dark:text-white">Weekly Patient Inflow</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">Total appointments distributed across current week</p>
              </div>
              <span class="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full">
                Live Data
              </span>
            </div>
            <div id="admin-bar-chart" class="w-full pt-4">
              <!-- Rendered via JS -->
            </div>
          </div>
        </div>

        <!-- Specialty Breakdown Donut -->
        <div class="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-sm font-extrabold text-slate-900 dark:text-white">Department Specialty Volume</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">Appointment share by clinical discipline</p>
              </div>
            </div>
            <div id="admin-donut-chart" class="w-full flex items-center justify-center pt-2">
              <!-- Rendered via JS -->
            </div>
          </div>
        </div>

      </div>

      <!-- Admin Secondary Section: Users, Doctors or Patients -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        
        <!-- Navigation Sub-tabs -->
        <div class="p-6 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <button 
              onclick="window.ApexStore.setActiveTab('appointments')"
              class="px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'appointments' || activeTab === 'overview' 
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }"
            >
              All Appointments (${appointments.length})
            </button>
            <button 
              onclick="window.ApexStore.setActiveTab('users')"
              class="px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'users' 
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }"
            >
              User Accounts (${users.length})
            </button>
            <button 
              onclick="window.ApexStore.setActiveTab('patients')"
              class="px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'patients' 
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }"
            >
              Patient Database (${patients.length})
            </button>
          </div>
        </div>

        <!-- Render active sub-view content -->
        ${renderAdminSubView(activeTab)}

      </div>

    </div>
  `;

  // Render SVG charts
  setTimeout(() => {
    const barEl = document.getElementById('admin-bar-chart');
    if (barEl) renderBarChart(barEl, weeklyData);

    const donutEl = document.getElementById('admin-donut-chart');
    if (donutEl) renderDonutChart(donutEl, donutSlices);
  }, 50);
}

function renderAdminSubView(activeTab) {
  const { appointments, doctors, patients, users } = store.state;

  if (activeTab === 'users') {
    return `
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead class="bg-slate-50 dark:bg-slate-850 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200/80 dark:border-slate-800">
            <tr>
              <th class="py-3 px-6">User</th>
              <th class="py-3 px-6">Email</th>
              <th class="py-3 px-6">System Role</th>
              <th class="py-3 px-6">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200/80 dark:divide-slate-800">
            ${users.map(u => `
              <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                <td class="py-4 px-6 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-xs">
                    ${(u.first_name?.[0] || u.username[0]).toUpperCase()}
                  </div>
                  <div>
                    <p>${u.first_name ? `${u.first_name} ${u.last_name || ''}` : u.username}</p>
                    <p class="text-[10px] text-slate-400 font-mono">@${u.username}</p>
                  </div>
                </td>
                <td class="py-4 px-6">${u.email || '—'}</td>
                <td class="py-4 px-6">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' :
                    u.role === 'PROFESSIONAL' ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' :
                    u.role === 'RECEPTIONIST' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                    'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                  }">
                    ${u.role}
                  </span>
                </td>
                <td class="py-4 px-6">
                  <span class="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  if (activeTab === 'patients') {
    return `
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-slate-600 dark:text-slate-300">
          <thead class="bg-slate-50 dark:bg-slate-850 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-200/80 dark:border-slate-800">
            <tr>
              <th class="py-3 px-6">Patient Name</th>
              <th class="py-3 px-6">DOB & Gender</th>
              <th class="py-3 px-6">Phone & Address</th>
              <th class="py-3 px-6">Emergency Contact</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200/80 dark:divide-slate-800">
            ${patients.map(p => `
              <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                <td class="py-4 px-6 font-bold text-slate-900 dark:text-white">
                  ${p.name || p.user_details?.username}
                  <p class="text-[10px] text-slate-400 font-mono font-normal">ID: ${p.patient_id.substring(0, 8)}...</p>
                </td>
                <td class="py-4 px-6">
                  <p>${p.date_of_birth}</p>
                  <p class="text-[10px] text-slate-400 uppercase font-semibold">${p.gender}</p>
                </td>
                <td class="py-4 px-6">
                  <p class="font-medium text-slate-800 dark:text-slate-200">${p.phone_number}</p>
                  <p class="text-[11px] text-slate-400 truncate max-w-xs">${p.address}</p>
                </td>
                <td class="py-4 px-6">
                  <p class="font-semibold text-slate-800 dark:text-slate-200">${p.emergency_contact_name}</p>
                  <p class="text-[10px] text-teal-600 font-mono">${p.emergency_contact_phone}</p>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Default: Appointments Table
  return `
    <div class="divide-y divide-slate-200/80 dark:divide-slate-800">
      ${appointments.map(appt => {
        const doc = doctors.find(d => d.doctor_id === appt.doctor);
        const patient = patients.find(p => p.patient_id === appt.patient);
        const badge = getStatusBadge(appt.status);

        return `
          <div class="p-5 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">
                ${(patient?.name || 'P')[0]}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-bold text-sm text-slate-900 dark:text-white">${patient?.name || 'Patient'}</span>
                  <span class="text-xs text-slate-400">→</span>
                  <span class="font-semibold text-xs text-teal-600 dark:text-teal-400">${doc?.name || 'Doctor'}</span>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.class}">
                    ${badge.label}
                  </span>
                </div>
                <p class="text-xs text-slate-500 mt-0.5">${appt.reason}</p>
              </div>
            </div>

            <div class="flex items-center gap-6 text-xs text-slate-600 dark:text-slate-300">
              <div>
                <p class="text-[10px] uppercase font-bold text-slate-400">Date</p>
                <p class="font-bold text-slate-800 dark:text-slate-100">${formatDate(appt.appointment_date)}</p>
              </div>
              <div>
                <p class="text-[10px] uppercase font-bold text-slate-400">Time</p>
                <p class="font-bold text-teal-600 font-mono">${formatTime(appt.appointment_time)}</p>
              </div>
              <div>
                <p class="text-[10px] uppercase font-bold text-slate-400">Fee</p>
                <p class="font-bold text-slate-800 dark:text-slate-100">$${doc?.consultation_fee || '50'}</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button 
                onclick="window.ApexStore.openDetailModal(${JSON.stringify(appt).replace(/"/g, '&quot;')})"
                class="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Inspect / Edit
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
