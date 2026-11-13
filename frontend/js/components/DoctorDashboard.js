/**
 * Healthcare Professional (Doctor) Workspace Dashboard Component
 */

import { store } from '../store.js';
import { api } from '../api.js';
import { formatDate, formatTime, formatCurrency, getStatusBadge } from '../utils/formatters.js';

export function renderDoctorDashboard(container) {
  if (!container) return;
  const { doctors, appointments, patients, currentUser, filters } = store.state;

  // Identify current doctor
  const currentDoc = doctors.find(d => d.user === currentUser?.id || d.user_details?.username === currentUser?.username) || doctors[0];

  // Appointments for this doctor
  const docAppts = appointments.filter(a => a.doctor === currentDoc?.doctor_id);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppts = docAppts.filter(a => a.appointment_date === todayStr);

  // Filtered by selected tab/status
  const activeAppts = docAppts.filter(a => {
    if (filters.status !== 'ALL' && a.status !== filters.status) return false;
    if (filters.date === 'TODAY') return a.appointment_date === todayStr;
    return true;
  });

  // Calculate doctor metrics
  const completedCount = docAppts.filter(a => a.status === 'COMPLETED').length;
  const estRevenue = completedCount * parseFloat(currentDoc?.consultation_fee || 0);

  container.innerHTML = `
    <div class="space-y-8 animate-fade-in">
      
      <!-- Doctor Profile & Duty Status Card -->
      <div class="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="flex items-center gap-5">
          <div class="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border-2 border-teal-500 shadow-md">
            <img src="${currentDoc?.avatar}" alt="${currentDoc?.name}" class="w-full h-full object-cover"/>
            <span class="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
              currentDoc?.is_available ? 'bg-emerald-500' : 'bg-slate-400'
            }"></span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">${currentDoc?.name}</h1>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                Staff Physician
              </span>
            </div>
            <p class="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-0.5">${currentDoc?.specialty} • ${currentDoc?.qualifications}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${currentDoc?.years_of_experience} Years Clinical Practice • Fee: $${currentDoc?.consultation_fee} / consult</p>
          </div>
        </div>

        <!-- Live Availability Switch -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700">
          <div>
            <p class="text-xs font-bold text-slate-900 dark:text-white">Clinic Duty Status</p>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              ${currentDoc?.is_available ? 'Accepting patient bookings' : 'Currently paused / in surgery'}
            </p>
          </div>
          <button 
            onclick="window.ApexToggleDoctorAvailability('${currentDoc?.doctor_id}')"
            class="px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
              currentDoc?.is_available 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' 
                : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }"
          >
            <span class="w-2 h-2 rounded-full ${currentDoc?.is_available ? 'bg-white animate-pulse' : 'bg-slate-400'}"></span>
            <span>${currentDoc?.is_available ? 'Duty Active' : 'Offline / Paused'}</span>
          </button>
        </div>
      </div>

      <!-- Doctor KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Visits</p>
          <p class="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">${todayAppts.length}</p>
          <p class="text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-1">Scheduled for today</p>
        </div>

        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Visits</p>
          <p class="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">${completedCount}</p>
          <p class="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1">Total treated patients</p>
        </div>

        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Consultation Fee</p>
          <p class="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">$${currentDoc?.consultation_fee}</p>
          <p class="text-[11px] text-sky-600 dark:text-sky-400 font-medium mt-1">Standard per visit</p>
        </div>

        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Generated Practice Revenue</p>
          <p class="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">${formatCurrency(estRevenue)}</p>
          <p class="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">From completed visits</p>
        </div>
      </div>

      <!-- Today's Patient Schedule & Clinical Action Center -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div class="p-6 border-b border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-extrabold text-slate-900 dark:text-white">Doctor Consultation Schedule</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">Manage patient intake, verify check-ins, and record clinical diagnosis notes.</p>
          </div>

          <div class="flex items-center gap-2">
            <button 
              onclick="window.ApexStore.setFilter('date', '${filters.date === 'TODAY' ? '' : 'TODAY'}')"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filters.date === 'TODAY' 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }"
            >
              Today's Queue (${todayAppts.length})
            </button>
            <button 
              onclick="window.ApexStore.setFilter('status', 'ALL'); window.ApexStore.setFilter('date', '')"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              All Schedule (${docAppts.length})
            </button>
          </div>
        </div>

        ${activeAppts.length === 0 ? `
          <div class="p-12 text-center text-slate-400">
            <p class="font-bold text-sm">No scheduled patient appointments for this view.</p>
          </div>
        ` : `
          <div class="divide-y divide-slate-200/80 dark:divide-slate-800">
            ${activeAppts.map(appt => {
              const patient = patients.find(p => p.patient_id === appt.patient);
              const patientName = patient?.name || patient?.user_details?.username || 'Patient';
              const badge = getStatusBadge(appt.status);

              return `
                <div class="p-6 hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  <!-- Patient Info & Medical Reason -->
                  <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-extrabold flex items-center justify-center text-sm flex-shrink-0 border border-teal-200 dark:border-teal-800">
                      ${patientName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div class="flex items-center gap-2 flex-wrap">
                        <h4 class="font-bold text-sm text-slate-900 dark:text-white cursor-pointer hover:text-teal-600" onclick="window.ApexStore.openDetailModal(${JSON.stringify(appt).replace(/"/g, '&quot;')})">
                          ${patientName}
                        </h4>
                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.class}">
                          <span class="w-1.5 h-1.5 rounded-full ${badge.dot}"></span>
                          ${badge.label}
                        </span>
                      </div>
                      <p class="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        <span class="font-semibold text-slate-800 dark:text-slate-200">Reason:</span> ${appt.reason}
                      </p>
                      <div class="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                        <span>DOB: ${patient?.date_of_birth || 'N/A'}</span>
                        <span>•</span>
                        <span>Tel: ${patient?.phone_number || 'N/A'}</span>
                        <span>•</span>
                        <span>Emergency: ${patient?.emergency_contact_name || 'N/A'}</span>
                      </div>
                      ${appt.notes ? `
                        <div class="mt-2 p-2 rounded-lg bg-teal-50/60 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/40 text-xs text-teal-900 dark:text-teal-200">
                          <span class="font-bold">Consultation Notes:</span> ${appt.notes}
                        </div>
                      ` : ''}
                    </div>
                  </div>

                  <!-- Date & Time -->
                  <div class="flex items-center gap-6 text-xs text-slate-600 dark:text-slate-300 flex-shrink-0">
                    <div>
                      <p class="text-[10px] uppercase font-bold text-slate-400">Date</p>
                      <p class="font-bold text-slate-800 dark:text-slate-100 mt-0.5">${formatDate(appt.appointment_date)}</p>
                    </div>
                    <div>
                      <p class="text-[10px] uppercase font-bold text-slate-400">Time</p>
                      <p class="font-bold text-teal-600 dark:text-teal-400 font-mono mt-0.5">${formatTime(appt.appointment_time)}</p>
                    </div>
                  </div>

                  <!-- Doctor Actions -->
                  <div class="flex items-center gap-2 self-end md:self-center">
                    ${appt.status !== 'COMPLETED' ? `
                      <button 
                        onclick="window.ApexUpdateStatus('${appt.appointment_id}', 'COMPLETED')"
                        class="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-all"
                        title="Mark Patient as Completed"
                      >
                        Complete ✓
                      </button>
                    ` : ''}

                    ${appt.status === 'SCHEDULED' ? `
                      <button 
                        onclick="window.ApexUpdateStatus('${appt.appointment_id}', 'CONFIRMED')"
                        class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                      >
                        Confirm
                      </button>
                    ` : ''}

                    <button 
                      onclick="window.ApexStore.openDetailModal(${JSON.stringify(appt).replace(/"/g, '&quot;')})"
                      class="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Notes & Rx 📝
                    </button>
                  </div>

                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

    </div>
  `;
}
