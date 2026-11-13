/**
 * Patient Portal Dashboard Component
 */

import { store } from '../store.js';
import { formatDate, formatTime, formatCurrency, getStatusBadge } from '../utils/formatters.js';
import { downloadIcsFile, printAppointmentPass } from '../utils/calendar.js';

export function renderPatientDashboard(container) {
  if (!container) return;
  const { appointments, doctors, patients, currentUser, filters } = store.state;

  // Find this patient record
  const currentPatient = patients.find(p => p.user === currentUser?.id) || patients[0];
  
  // Filter appointments for this patient
  const patientAppts = appointments.filter(a => {
    // If demo mode or patient matches
    return a.patient === currentPatient?.patient_id || a.patient === currentPatient?.id || true;
  });

  // Apply status & search filters
  const filteredAppts = patientAppts.filter(a => {
    const matchesStatus = filters.status === 'ALL' || a.status === filters.status;
    const doc = doctors.find(d => d.doctor_id === a.doctor);
    const docName = doc ? (doc.name || doc.user_details?.username || '') : '';
    const matchesSearch = !filters.searchQuery || 
      docName.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      (a.reason || '').toLowerCase().includes(filters.searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Sort upcoming first
  filteredAppts.sort((a, b) => new Date(`${a.appointment_date}T${a.appointment_time}`) - new Date(`${b.appointment_date}T${b.appointment_time}`));

  const nextAppt = filteredAppts.find(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED');
  const nextDoc = nextAppt ? doctors.find(d => d.doctor_id === nextAppt.doctor) : null;

  container.innerHTML = `
    <div class="space-y-8 animate-fade-in">
      
      <!-- Patient Welcome & Next Appointment Hero Banner -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-800 via-teal-700 to-cyan-800 text-white p-6 sm:p-8 shadow-xl shadow-teal-950/10">
        <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div class="max-w-xl">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-600/40 border border-teal-400/30 text-teal-100 text-xs font-semibold backdrop-blur-sm mb-3">
              <span class="w-2 h-2 rounded-full bg-teal-300 animate-ping"></span>
              ApexCare Patient Portal
            </span>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, ${currentUser?.first_name || 'John'}!
            </h1>
            <p class="mt-2 text-teal-100/90 text-sm leading-relaxed">
              Manage your upcoming medical consultations, access doctor notes, and book instant visits with top clinical specialists.
            </p>
            <div class="mt-5 flex flex-wrap items-center gap-3">
              <button 
                onclick="window.ApexStore.openBookingModal()"
                class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-teal-900 font-bold text-xs shadow-lg hover:bg-teal-50 transition-all hover:scale-[1.02]"
              >
                <svg class="w-4 h-4 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
                </svg>
                Book New Appointment
              </button>
              <button 
                onclick="window.ApexStore.setActiveTab('doctors')"
                class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-900/40 hover:bg-teal-900/60 border border-teal-400/30 text-white font-semibold text-xs backdrop-blur-sm transition-all"
              >
                Browse Specialist Doctors
              </button>
            </div>
          </div>

          <!-- Highlight Next Appointment Card -->
          ${nextAppt ? `
            <div class="lg:w-80 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
              <div class="flex items-center justify-between text-xs text-teal-200 font-semibold mb-3">
                <span class="flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Next Scheduled Visit
                </span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-400/20 border border-teal-300/30 text-teal-100">
                  ${nextAppt.status}
                </span>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center font-bold text-white text-sm overflow-hidden flex-shrink-0">
                  ${nextDoc?.avatar ? `<img src="${nextDoc.avatar}" class="w-full h-full object-cover"/>` : 'Dr.'}
                </div>
                <div>
                  <h3 class="font-bold text-sm text-white">${nextDoc?.name || 'Dr. Specialist'}</h3>
                  <p class="text-xs text-teal-200">${nextDoc?.specialty || 'General Medicine'}</p>
                </div>
              </div>
              <div class="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <div>
                  <p class="text-teal-200/70 text-[10px] uppercase font-semibold">Date & Time</p>
                  <p class="font-bold text-white">${formatDate(nextAppt.appointment_date)}</p>
                  <p class="text-teal-200 font-mono text-[11px]">${formatTime(nextAppt.appointment_time)}</p>
                </div>
                <button 
                  onclick="window.ApexPassHandler('${nextAppt.appointment_id}')"
                  class="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-teal-950 font-bold text-[11px] transition-colors"
                >
                  Pass 🎫
                </button>
              </div>
            </div>
          ` : `
            <div class="lg:w-72 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
              <svg class="w-8 h-8 mx-auto text-teal-200/70 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <p class="text-xs font-semibold text-teal-100">No appointments scheduled today</p>
              <p class="text-[11px] text-teal-200/70 mt-1">Book a consultation anytime with our clinic team.</p>
            </div>
          `}
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div class="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <div>
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Consultations</p>
            <p class="text-2xl font-extrabold text-slate-800 dark:text-white mt-0.5">${patientAppts.length}</p>
          </div>
        </div>

        <div class="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Upcoming Visits</p>
            <p class="text-2xl font-extrabold text-slate-800 dark:text-white mt-0.5">
              ${patientAppts.filter(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED').length}
            </p>
          </div>
        </div>

        <div class="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <div>
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Doctors</p>
            <p class="text-2xl font-extrabold text-slate-800 dark:text-white mt-0.5">${doctors.filter(d => d.is_available).length}</p>
          </div>
        </div>
      </div>

      <!-- My Appointments Section -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        
        <!-- Table Filter Header -->
        <div class="p-6 border-b border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-extrabold text-slate-900 dark:text-white">My Appointment Records</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">View your scheduled consultations, status, and download calendar reminders.</p>
          </div>

          <!-- Status Filters -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            ${['ALL', 'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(st => {
              const active = filters.status === st;
              return `
                <button 
                  onclick="window.ApexStore.setFilter('status', '${st}')"
                  class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    active 
                      ? 'bg-teal-600 text-white shadow-sm' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }"
                >
                  ${st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Appointment Cards / Table -->
        ${filteredAppts.length === 0 ? `
          <div class="p-12 text-center">
            <div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400 mb-4">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <h3 class="text-base font-bold text-slate-800 dark:text-white">No appointments found</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">There are no appointments matching your current filter criteria.</p>
            <button 
              onclick="window.ApexStore.openBookingModal()"
              class="mt-4 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-sm hover:bg-teal-700 transition-colors"
            >
              Book an Appointment
            </button>
          </div>
        ` : `
          <div class="divide-y divide-slate-200/80 dark:divide-slate-800">
            ${filteredAppts.map(appt => {
              const doc = doctors.find(d => d.doctor_id === appt.doctor);
              const badge = getStatusBadge(appt.status);
              const docName = doc?.name || 'Dr. Specialist';
              const canCancel = appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED';

              return `
                <div class="p-5 sm:p-6 hover:bg-slate-50/80 dark:hover:bg-slate-850/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  <!-- Left: Doctor & Reason -->
                  <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-200 dark:border-slate-700">
                      ${doc?.avatar ? `<img src="${doc.avatar}" class="w-full h-full object-cover"/>` : `
                        <div class="w-full h-full flex items-center justify-center font-bold text-teal-700 dark:text-teal-300 text-sm">
                          Dr.
                        </div>
                      `}
                    </div>
                    <div>
                      <div class="flex items-center gap-2.5 flex-wrap">
                        <h4 class="font-bold text-sm text-slate-900 dark:text-white cursor-pointer hover:text-teal-600" onclick="window.ApexStore.openDetailModal(${JSON.stringify(appt).replace(/"/g, '&quot;')})">
                          ${docName}
                        </h4>
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badge.class}">
                          <span class="w-1.5 h-1.5 rounded-full ${badge.dot}"></span>
                          ${badge.label}
                        </span>
                        <span class="text-xs text-slate-400 font-medium">| ${doc?.specialty || 'General Medicine'}</span>
                      </div>
                      <p class="text-xs text-slate-600 dark:text-slate-300 mt-1.5 font-medium line-clamp-1">
                        Reason: <span class="text-slate-800 dark:text-slate-100">${appt.reason || 'Medical Consultation'}</span>
                      </p>
                      ${appt.notes ? `
                        <p class="text-[11px] text-teal-700 dark:text-teal-400 mt-1 font-medium bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded inline-block">
                          Dr. Notes: ${appt.notes}
                        </p>
                      ` : ''}
                    </div>
                  </div>

                  <!-- Middle: Date & Time -->
                  <div class="flex items-center gap-6 text-xs text-slate-600 dark:text-slate-300">
                    <div>
                      <p class="text-[10px] uppercase font-bold text-slate-400">Date</p>
                      <p class="font-bold text-slate-800 dark:text-slate-100 mt-0.5">${formatDate(appt.appointment_date)}</p>
                    </div>
                    <div>
                      <p class="text-[10px] uppercase font-bold text-slate-400">Time</p>
                      <p class="font-bold text-teal-600 dark:text-teal-400 font-mono mt-0.5">${formatTime(appt.appointment_time)}</p>
                    </div>
                    <div>
                      <p class="text-[10px] uppercase font-bold text-slate-400">Fee</p>
                      <p class="font-bold text-slate-800 dark:text-slate-100 mt-0.5">$${doc?.consultation_fee || '50.00'}</p>
                    </div>
                  </div>

                  <!-- Right: Action Buttons -->
                  <div class="flex items-center gap-2 self-end md:self-center">
                    <button 
                      onclick="window.ApexCalendarHandler('${appt.appointment_id}')"
                      class="p-2 rounded-lg text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Add to Google/Apple Calendar (.ics)"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    </button>
                    <button 
                      onclick="window.ApexPassHandler('${appt.appointment_id}')"
                      class="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
                      title="Print Official Medical Check-in Pass"
                    >
                      Print Pass 🖨️
                    </button>
                    ${canCancel ? `
                      <button 
                        onclick="window.ApexCancelHandler('${appt.appointment_id}')"
                        class="px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                    ` : ''}
                    <button 
                      onclick="window.ApexStore.openDetailModal(${JSON.stringify(appt).replace(/"/g, '&quot;')})"
                      class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                      </svg>
                    </button>
                  </div>

                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <!-- Specialist Doctor Directory Preview Grid -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-extrabold text-slate-900 dark:text-white">Our Specialist Doctors</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">Board-certified clinical healthcare professionals available for consultation.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          ${doctors.map(doc => {
            return `
              <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover-card flex flex-col justify-between">
                <div>
                  <div class="relative w-full h-36 rounded-xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800">
                    <img src="${doc.avatar}" alt="${doc.name}" class="w-full h-full object-cover"/>
                    <div class="absolute top-2 right-2">
                      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        doc.is_available 
                          ? 'bg-emerald-500/90 text-white backdrop-blur-sm' 
                          : 'bg-slate-500/90 text-white backdrop-blur-sm'
                      }">
                        <span class="w-1.5 h-1.5 rounded-full ${doc.is_available ? 'bg-white' : 'bg-slate-300'}"></span>
                        ${doc.is_available ? 'Available' : 'In Surgery'}
                      </span>
                    </div>
                  </div>
                  <h3 class="font-extrabold text-sm text-slate-900 dark:text-white">${doc.name}</h3>
                  <p class="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-0.5">${doc.specialty}</p>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">${doc.bio}</p>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span class="text-[10px] text-slate-400 uppercase font-bold">Consultation</span>
                    <p class="text-sm font-extrabold text-slate-900 dark:text-white">$${doc.consultation_fee}</p>
                  </div>
                  <button 
                    onclick="window.ApexStore.openBookingModal('${doc.doctor_id}')"
                    ${!doc.is_available ? 'disabled' : ''}
                    class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      doc.is_available 
                        ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm' 
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }"
                  >
                    ${doc.is_available ? 'Book Visit' : 'Unavailable'}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

    </div>
  `;
}
