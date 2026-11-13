/**
 * 5-Step Interactive Appointment Booking Wizard Component
 */

import { store } from '../store.js';
import { api } from '../api.js';
import { MOCK_SPECIALTIES, AVAILABLE_TIME_SLOTS } from '../mockData.js';
import { formatDate, formatTime, formatCurrency } from '../utils/formatters.js';

export function renderBookingModal(container) {
  if (!container) return;
  const { modals, doctors, patients, appointments, currentUser, selectedDoctor } = store.state;

  if (!modals.booking) {
    container.innerHTML = '';
    return;
  }

  // Preselected doctor or first available
  const defaultDoc = selectedDoctor 
    ? doctors.find(d => d.doctor_id === selectedDoctor) 
    : doctors.find(d => d.is_available) || doctors[0];

  const currentPatient = patients.find(p => p.user === currentUser?.id) || patients[0];

  const todayStr = new Date().toISOString().split('T')[0];

  // Quick symptoms
  const symptomChips = [
    'Annual Routine Checkup',
    'Fever & Cold Symptoms',
    'Chest Discomfort / Palpitations',
    'Skin Rash / Allergic Flare-up',
    'Joint Pain / Sports Injury',
    'Prescription Refill',
    'Follow-up Consultation',
  ];

  container.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div class="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        <!-- Header -->
        <div class="p-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-extrabold text-slate-900 dark:text-white">Book Clinic Appointment</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">Step-by-step specialist consultation scheduling</p>
            </div>
          </div>
          <button 
            onclick="window.ApexStore.closeBookingModal()"
            class="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Scrollable Form Body -->
        <form id="booking-wizard-form" class="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          
          <!-- Step 1: Doctor Selection -->
          <div class="space-y-3">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              1. Select Specialist Physician <span class="text-rose-500">*</span>
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${doctors.map(doc => {
                const isSelected = defaultDoc?.doctor_id === doc.doctor_id;
                return `
                  <label class="relative flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 ring-2 ring-teal-500/20' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }">
                    <input 
                      type="radio" 
                      name="booking_doctor" 
                      value="${doc.doctor_id}" 
                      ${isSelected ? 'checked' : ''} 
                      onchange="window.ApexBookingDocChange(this.value)"
                      class="hidden"
                    />
                    <div class="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                      <img src="${doc.avatar}" class="w-full h-full object-cover"/>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-bold text-xs text-slate-900 dark:text-white truncate">${doc.name}</p>
                      <p class="text-[11px] font-semibold text-teal-600 dark:text-teal-400">${doc.specialty}</p>
                      <div class="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                        <span>${doc.years_of_experience} yrs exp</span>
                        <span>•</span>
                        <span class="font-bold text-slate-700 dark:text-slate-300">$${doc.consultation_fee}</span>
                      </div>
                    </div>
                    ${isSelected ? `
                      <div class="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center flex-shrink-0">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                        </svg>
                      </div>
                    ` : ''}
                  </label>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Step 2: Date & Time Selection -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <!-- Date Input -->
            <div class="space-y-2">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                2. Consultation Date <span class="text-rose-500">*</span>
              </label>
              <input 
                type="date" 
                id="booking-date" 
                name="appointment_date"
                min="${todayStr}" 
                value="${todayStr}"
                required
                onchange="window.ApexBookingDateChange(this.value)"
                class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <!-- Estimated Fee Pill -->
            <div class="space-y-2">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Consultation Fee
              </label>
              <div class="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-extrabold text-teal-700 dark:text-teal-400 flex items-center justify-between">
                <span>Direct Clinical Visit</span>
                <span id="booking-fee-display">$${defaultDoc?.consultation_fee || '50.00'}</span>
              </div>
            </div>

          </div>

          <!-- Time Slot Grid -->
          <div class="space-y-2">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              3. Available Time Slot <span class="text-rose-500">*</span>
            </label>
            <div id="booking-slots-container" class="grid grid-cols-3 sm:grid-cols-4 gap-2">
              <!-- Rendered dynamically -->
            </div>
          </div>

          <!-- Step 4: Medical Reason & Symptoms -->
          <div class="space-y-2">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              4. Reason for Consultation & Symptoms <span class="text-rose-500">*</span>
            </label>
            <div class="flex flex-wrap gap-1.5 mb-2">
              ${symptomChips.map(chip => `
                <button 
                  type="button" 
                  onclick="window.ApexAppendReason('${chip}')"
                  class="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 hover:bg-teal-50 dark:bg-slate-800 dark:hover:bg-teal-950/60 hover:text-teal-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  + ${chip}
                </button>
              `).join('')}
            </div>
            <textarea 
              id="booking-reason" 
              name="reason" 
              rows="3" 
              required
              placeholder="Describe your symptoms, main concerns, or medical history relevant to this appointment..."
              class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            >Routine comprehensive health checkup and consultation.</textarea>
          </div>

          <!-- Step 5: Summary Notice -->
          <div class="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/60 flex items-start gap-3">
            <svg class="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <div class="text-xs text-teal-900 dark:text-teal-200 space-y-1">
              <p class="font-bold">Instant Booking Confirmation</p>
              <p class="text-[11px] text-teal-800/90 dark:text-teal-300 leading-relaxed">
                By booking, your appointment will be reserved in the clinic schedule. You can reschedule or cancel anytime without fee up to 2 hours before the visit.
              </p>
            </div>
          </div>

        </form>

        <!-- Footer Actions -->
        <div class="p-6 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <button 
            type="button" 
            onclick="window.ApexStore.closeBookingModal()"
            class="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button" 
            id="submit-booking-btn"
            onclick="window.ApexSubmitBooking()"
            class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition-all hover:scale-[1.02]"
          >
            Confirm & Reserve Visit 🩺
          </button>
        </div>

      </div>
    </div>
  `;

  // Render slots for default doctor and date
  setTimeout(() => {
    updateTimeSlots(defaultDoc?.doctor_id, todayStr);
  }, 50);
}

export function updateTimeSlots(doctorId, dateStr) {
  const container = document.getElementById('booking-slots-container');
  if (!container) return;

  const { appointments } = store.state;
  
  // Find booked slots for this doctor on this date
  const bookedSlots = (appointments || [])
    .filter(a => a.doctor === doctorId && a.appointment_date === dateStr && a.status !== 'CANCELLED')
    .map(a => a.appointment_time);

  let selectedTime = null;

  container.innerHTML = AVAILABLE_TIME_SLOTS.map((slot, index) => {
    const isBooked = bookedSlots.includes(slot);
    const isFirstAvailable = !isBooked && !selectedTime;
    if (isFirstAvailable) selectedTime = slot;

    return `
      <label class="relative flex items-center justify-center py-2 px-2.5 rounded-xl border text-xs font-mono font-bold transition-all ${
        isBooked 
          ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-50' 
          : isFirstAvailable 
            ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 ring-2 ring-teal-500/20 cursor-pointer' 
            : 'border-slate-200 dark:border-slate-700 hover:border-teal-300 text-slate-700 dark:text-slate-200 cursor-pointer'
      }">
        <input 
          type="radio" 
          name="booking_time" 
          value="${slot}" 
          ${isBooked ? 'disabled' : ''} 
          ${isFirstAvailable ? 'checked' : ''} 
          class="hidden"
          onchange="window.ApexSelectSlot(this)"
        />
        <span>${formatTime(slot)}</span>
        ${isBooked ? '<span class="absolute -top-1 -right-1 text-[8px] bg-rose-500 text-white px-1 rounded-full">Booked</span>' : ''}
      </label>
    `;
  }).join('');
}
