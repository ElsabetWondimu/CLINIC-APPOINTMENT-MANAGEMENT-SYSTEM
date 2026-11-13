/**
 * Reception Desk Central Command Component
 */

import { store } from '../store.js';
import { formatDate, formatTime, getStatusBadge } from '../utils/formatters.js';

export function renderReceptionDashboard(container) {
  if (!container) return;
  const { appointments, doctors, patients, filters } = store.state;

  const todayStr = new Date().toISOString().split('T')[0];

  // Today's clinic queue
  const todayAppts = appointments.filter(a => a.appointment_date === todayStr);

  const waitingCount = todayAppts.filter(a => a.status === 'SCHEDULED').length;
  const checkedInCount = todayAppts.filter(a => a.status === 'CONFIRMED').length;
  const completedToday = todayAppts.filter(a => a.status === 'COMPLETED').length;

  container.innerHTML = `
    <div class="space-y-8 animate-fade-in">
      
      <!-- Reception Desk Header Banner -->
      <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-xl shadow-amber-950/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-sm mb-3">
            <span class="w-2 h-2 rounded-full bg-amber-200 animate-ping"></span>
            Front Desk Operations Hub
          </span>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">Clinic Reception Command</h1>
          <p class="text-xs sm:text-sm text-amber-100 mt-1 max-w-xl">
            Live patient check-in counter, walk-in consultation booking, and clinic doctor availability management.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button 
            onclick="window.ApexStore.openBookingModal()"
            class="px-5 py-2.5 rounded-xl bg-white text-amber-900 font-bold text-xs shadow-lg hover:bg-amber-50 transition-all hover:scale-[1.02] flex items-center gap-2"
          >
            <svg class="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
            </svg>
            <span>Rapid Walk-in Booking</span>
          </button>
        </div>
      </div>

      <!-- Quick Operational Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Scheduled Today</p>
          <p class="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">${todayAppts.length}</p>
          <p class="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">Total roster today</p>
        </div>

        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Check-in</p>
          <p class="text-2xl font-extrabold text-sky-600 dark:text-sky-400 mt-1">${waitingCount}</p>
          <p class="text-[11px] text-sky-600 dark:text-sky-400 font-medium mt-1">Awaiting arrival</p>
        </div>

        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Checked In / Confirmed</p>
          <p class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">${checkedInCount}</p>
          <p class="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">In waiting lobby</p>
        </div>

        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Today</p>
          <p class="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">${completedToday}</p>
          <p class="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1">Visits finished</p>
        </div>
      </div>

      <!-- Main Operational Queue Table -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-extrabold text-slate-900 dark:text-white">Today's Patient Arrival Queue</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">Manage patient intake, verify insurance/copay, and notify attending doctor.</p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-slate-500 dark:text-slate-400">Filter Queue:</span>
            <button 
              onclick="window.ApexStore.setFilter('status', 'ALL')"
              class="px-2.5 py-1 rounded-lg text-xs font-semibold ${filters.status === 'ALL' ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}"
            >
              All (${todayAppts.length})
            </button>
            <button 
              onclick="window.ApexStore.setFilter('status', 'SCHEDULED')"
              class="px-2.5 py-1 rounded-lg text-xs font-semibold ${filters.status === 'SCHEDULED' ? 'bg-sky-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}"
            >
              Pending (${waitingCount})
            </button>
            <button 
              onclick="window.ApexStore.setFilter('status', 'CONFIRMED')"
              class="px-2.5 py-1 rounded-lg text-xs font-semibold ${filters.status === 'CONFIRMED' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}"
            >
              In Lobby (${checkedInCount})
            </button>
          </div>
        </div>

        ${todayAppts.length === 0 ? `
          <div class="p-12 text-center text-slate-400">
            <p class="font-bold text-sm">No appointments scheduled for today yet.</p>
            <button 
              onclick="window.ApexStore.openBookingModal()"
              class="mt-3 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold"
            >
              Book Walk-in Patient
            </button>
          </div>
        ` : `
          <div class="divide-y divide-slate-200/80 dark:divide-slate-800">
            ${todayAppts.map(appt => {
              const doc = doctors.find(d => d.doctor_id === appt.doctor);
              const patient = patients.find(p => p.patient_id === appt.patient);
              const patientName = patient?.name || patient?.user_details?.username || 'Patient';
              const docName = doc?.name || 'Dr. Specialist';
              const badge = getStatusBadge(appt.status);

              return `
                <div class="p-6 hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-extrabold flex items-center justify-center text-sm flex-shrink-0 border border-amber-200 dark:border-amber-800">
                      ${patientName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div class="flex items-center gap-2 flex-wrap">
                        <h4 class="font-bold text-sm text-slate-900 dark:text-white cursor-pointer hover:text-amber-600" onclick="window.ApexStore.openDetailModal(${JSON.stringify(appt).replace(/"/g, '&quot;')})">
                          ${patientName}
                        </h4>
                        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.class}">
                          <span class="w-1.5 h-1.5 rounded-full ${badge.dot}"></span>
                          ${badge.label}
                        </span>
                        <span class="text-xs text-slate-400 font-medium">with ${docName}</span>
                      </div>
                      <p class="text-xs text-slate-600 dark:text-slate-300 mt-1">${appt.reason}</p>
                      <div class="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                        <span>Tel: ${patient?.phone_number || 'N/A'}</span>
                        <span>•</span>
                        <span>Emergency: ${patient?.emergency_contact_name || 'N/A'} (${patient?.emergency_contact_phone || 'N/A'})</span>
                      </div>
                      ${appt.notes ? `
                        <p class="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded inline-block">
                          Note: ${appt.notes}
                        </p>
                      ` : ''}
                    </div>
                  </div>

                  <div class="flex items-center gap-6 text-xs text-slate-600 dark:text-slate-300 flex-shrink-0">
                    <div>
                      <p class="text-[10px] uppercase font-bold text-slate-400">Arrival Time</p>
                      <p class="font-bold text-amber-600 dark:text-amber-400 font-mono text-sm">${formatTime(appt.appointment_time)}</p>
                    </div>
                  </div>

                  <!-- Front Desk Action Buttons -->
                  <div class="flex items-center gap-2 self-end md:self-center">
                    ${appt.status === 'SCHEDULED' ? `
                      <button 
                        onclick="window.ApexUpdateStatus('${appt.appointment_id}', 'CONFIRMED')"
                        class="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                      >
                        Check In ✓
                      </button>
                    ` : ''}

                    ${appt.status === 'CONFIRMED' ? `
                      <button 
                        onclick="window.ApexUpdateStatus('${appt.appointment_id}', 'COMPLETED')"
                        class="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all"
                      >
                        Mark Done
                      </button>
                    ` : ''}

                    <button 
                      onclick="window.ApexPassHandler('${appt.appointment_id}')"
                      class="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Print Check-in Pass"
                    >
                      Slip 🖨️
                    </button>

                    <button 
                      onclick="window.ApexStore.openDetailModal(${JSON.stringify(appt).replace(/"/g, '&quot;')})"
                      class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <!-- Doctor Duty Board for Reception -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-extrabold text-slate-900 dark:text-white">Doctor Clinic Availability Board</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">Live roster of on-duty physicians for patient inquiries.</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${doctors.map(doc => `
            <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                  <img src="${doc.avatar}" class="w-full h-full object-cover"/>
                </div>
                <div>
                  <p class="text-xs font-bold text-slate-900 dark:text-white truncate">${doc.name}</p>
                  <p class="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">${doc.specialty}</p>
                </div>
              </div>

              <button 
                onclick="window.ApexToggleDoctorAvailability('${doc.doctor_id}')"
                class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-colors ${
                  doc.is_available 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                    : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }"
                title="Click to toggle availability"
              >
                ${doc.is_available ? 'On Duty' : 'Away'}
              </button>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;
}
