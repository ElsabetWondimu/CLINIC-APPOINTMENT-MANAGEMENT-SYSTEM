/**
 * Appointment Details, Status Management & Clinical Notes Modal
 */

import { store } from '../store.js';
import { formatDate, formatTime, formatCurrency, getStatusBadge } from '../utils/formatters.js';

export function renderAppointmentDetailModal(container) {
  if (!container) return;
  const { modals, selectedAppointment, doctors, patients, currentRole } = store.state;

  if (!modals.detail || !selectedAppointment) {
    container.innerHTML = '';
    return;
  }

  const appt = selectedAppointment;
  const doc = doctors.find(d => d.doctor_id === appt.doctor);
  const patient = patients.find(p => p.patient_id === appt.patient);
  const badge = getStatusBadge(appt.status);

  const canEditStatus = currentRole === 'ADMIN' || currentRole === 'RECEPTIONIST' || currentRole === 'PROFESSIONAL';
  const canCancel = appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED';

  container.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div class="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        <!-- Header -->
        <div class="p-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badge.class}">
                <span class="w-1.5 h-1.5 rounded-full ${badge.dot}"></span>
                ${badge.label}
              </span>
              <span class="text-xs text-slate-400 font-mono">ID: ${appt.appointment_id ? appt.appointment_id.substring(0, 8) : ''}</span>
            </div>
            <h2 class="text-lg font-extrabold text-slate-900 dark:text-white mt-1">Appointment Record</h2>
          </div>
          <button 
            onclick="window.ApexStore.closeDetailModal()"
            class="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          
          <!-- Key Info Grid -->
          <div class="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 text-xs">
            <div>
              <p class="text-[10px] uppercase font-bold text-slate-400">Scheduled Date</p>
              <p class="font-extrabold text-slate-900 dark:text-white mt-0.5">${formatDate(appt.appointment_date)}</p>
            </div>
            <div>
              <p class="text-[10px] uppercase font-bold text-slate-400">Consultation Time</p>
              <p class="font-extrabold text-teal-600 dark:text-teal-400 font-mono mt-0.5">${formatTime(appt.appointment_time)}</p>
            </div>
            <div>
              <p class="text-[10px] uppercase font-bold text-slate-400">Patient</p>
              <p class="font-bold text-slate-900 dark:text-white mt-0.5">${patient?.name || 'Patient'}</p>
              <p class="text-[10px] text-slate-400">Tel: ${patient?.phone_number || 'N/A'}</p>
            </div>
            <div>
              <p class="text-[10px] uppercase font-bold text-slate-400">Attending Physician</p>
              <p class="font-bold text-slate-900 dark:text-white mt-0.5">${doc?.name || 'Doctor'}</p>
              <p class="text-[10px] text-teal-600 dark:text-teal-400">${doc?.specialty || ''}</p>
            </div>
          </div>

          <!-- Reason -->
          <div class="space-y-1">
            <label class="text-[10px] uppercase font-bold text-slate-400">Medical Reason / Symptoms</label>
            <p class="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200">
              ${appt.reason || 'General Medical Consultation'}
            </p>
          </div>

          <!-- Clinical / Reception Notes -->
          <div class="space-y-1">
            <label class="text-[10px] uppercase font-bold text-slate-400">
              Clinical & Administrative Notes ${canEditStatus ? '(Editable)' : ''}
            </label>
            <textarea 
              id="detail-modal-notes" 
              rows="3" 
              ${!canEditStatus ? 'readonly' : ''}
              placeholder="Add doctor recommendations, vital signs, or reception notes..."
              class="w-full p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >${appt.notes || ''}</textarea>
          </div>

          <!-- Status Modification (If Authorized) -->
          ${canEditStatus ? `
            <div class="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label class="text-[10px] uppercase font-bold text-slate-400">Change Appointment Status</label>
              <div class="flex flex-wrap gap-2">
                ${['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(s => `
                  <button 
                    type="button" 
                    onclick="window.ApexSaveDetailUpdates('${s}')"
                    class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      appt.status === s 
                        ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-500/20' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }"
                  >
                    ${s}
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}

        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div class="flex items-center gap-2">
            <button 
              type="button" 
              onclick="window.ApexPassHandler('${appt.appointment_id}')"
              class="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              Print Pass 🖨️
            </button>
            <button 
              type="button" 
              onclick="window.ApexCalendarHandler('${appt.appointment_id}')"
              class="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              Add to Calendar (.ics)
            </button>
          </div>

          <div class="flex items-center gap-2">
            ${canCancel ? `
              <button 
                type="button" 
                onclick="window.ApexCancelHandler('${appt.appointment_id}')"
                class="px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors"
              >
                Cancel Visit
              </button>
            ` : ''}

            ${canEditStatus ? `
              <button 
                type="button" 
                onclick="window.ApexSaveDetailUpdates()"
                class="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-colors"
              >
                Save Changes
              </button>
            ` : ''}
          </div>
        </div>

      </div>
    </div>
  `;
}
