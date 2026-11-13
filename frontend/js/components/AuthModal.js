/**
 * Authentication Modal: Login & Full Patient Registration
 * Matches apps/users/serializers.py UserSerializer fields
 */

import { store } from '../store.js';

export function renderAuthModal(container) {
  if (!container) return;
  const { modals } = store.state;

  if (!modals.auth) {
    container.innerHTML = '';
    return;
  }

  const isRegister = modals.authMode === 'register';

  container.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div class="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        <!-- Header -->
        <div class="p-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div>
            <h2 class="text-lg font-extrabold text-slate-900 dark:text-white">
              ${isRegister ? 'Register as Patient' : 'Clinic System Access'}
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              ${isRegister ? 'Create patient profile & book consultations' : 'Sign in with Django Token Authentication'}
            </p>
          </div>
          <button 
            onclick="window.ApexStore.closeAuthModal()"
            class="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Mode Switcher Tabs -->
        <div class="flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-center">
          <button 
            onclick="window.ApexStore.openAuthModal('login')"
            class="flex-1 py-3 border-b-2 transition-colors ${
              !isRegister 
                ? 'border-teal-600 text-teal-600 dark:text-teal-400 bg-teal-50/30 dark:bg-teal-950/20' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }"
          >
            Sign In
          </button>
          <button 
            onclick="window.ApexStore.openAuthModal('register')"
            class="flex-1 py-3 border-b-2 transition-colors ${
              isRegister 
                ? 'border-teal-600 text-teal-600 dark:text-teal-400 bg-teal-50/30 dark:bg-teal-950/20' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }"
          >
            New Patient Registration
          </button>
        </div>

        <!-- Form Body -->
        <div class="p-6 overflow-y-auto flex-1">
          ${!isRegister ? `
            <!-- Login Form -->
            <form id="auth-login-form" onsubmit="window.ApexHandleLoginSubmit(event)" class="space-y-4">
              <div class="space-y-1.5">
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500">Username</label>
                <input 
                  type="text" 
                  name="username" 
                  required 
                  placeholder="admin, receptionist, dr.sarah, patient.john"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div class="space-y-1.5">
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
                <input 
                  type="password" 
                  name="password" 
                  required 
                  placeholder="••••••••"
                  class="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <button 
                type="submit" 
                class="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition-all hover:scale-[1.01]"
              >
                Authenticate with Server
              </button>

              <!-- One-Click Quick Tester Buttons -->
              <div class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Quick Evaluation Accounts</p>
                <div class="grid grid-cols-2 gap-2">
                  <button type="button" onclick="window.ApexFillAndLogin('admin')" class="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-teal-50 hover:text-teal-700">
                    👑 Admin
                  </button>
                  <button type="button" onclick="window.ApexFillAndLogin('receptionist')" class="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-amber-50 hover:text-amber-700">
                    👩‍💼 Receptionist
                  </button>
                  <button type="button" onclick="window.ApexFillAndLogin('dr.sarah')" class="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-teal-50 hover:text-teal-700">
                    🩺 Dr. Sarah (Doctor)
                  </button>
                  <button type="button" onclick="window.ApexFillAndLogin('patient.john')" class="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-sky-50 hover:text-sky-700">
                    🧑 John Doe (Patient)
                  </button>
                </div>
              </div>
            </form>
          ` : `
            <!-- Full Patient Registration Form Matching DRF Serializer -->
            <form id="auth-register-form" onsubmit="window.ApexHandleRegisterSubmit(event)" class="space-y-4 text-xs">
              
              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="block font-bold uppercase text-[10px] text-slate-400">First Name</label>
                  <input type="text" name="first_name" required placeholder="Alice" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"/>
                </div>
                <div class="space-y-1">
                  <label class="block font-bold uppercase text-[10px] text-slate-400">Last Name</label>
                  <input type="text" name="last_name" required placeholder="Morgan" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"/>
                </div>
              </div>

              <div class="space-y-1">
                <label class="block font-bold uppercase text-[10px] text-slate-400">Username <span class="text-rose-500">*</span></label>
                <input type="text" name="username" required placeholder="alice.morgan" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"/>
              </div>

              <div class="space-y-1">
                <label class="block font-bold uppercase text-[10px] text-slate-400">Email Address</label>
                <input type="email" name="email" required placeholder="alice@example.com" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"/>
              </div>

              <div class="space-y-1">
                <label class="block font-bold uppercase text-[10px] text-slate-400">Password <span class="text-rose-500">*</span></label>
                <input type="password" name="password" required placeholder="••••••••" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"/>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="block font-bold uppercase text-[10px] text-slate-400">Date of Birth <span class="text-rose-500">*</span></label>
                  <input type="date" name="date_of_birth" required max="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"/>
                </div>
                <div class="space-y-1">
                  <label class="block font-bold uppercase text-[10px] text-slate-400">Gender <span class="text-rose-500">*</span></label>
                  <select name="gender" required class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold">
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div class="space-y-1">
                <label class="block font-bold uppercase text-[10px] text-slate-400">Phone Number <span class="text-rose-500">*</span></label>
                <input type="tel" name="phone_number" required placeholder="+1 (555) 000-1122" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"/>
              </div>

              <div class="space-y-1">
                <label class="block font-bold uppercase text-[10px] text-slate-400">Home Address <span class="text-rose-500">*</span></label>
                <input type="text" name="address" required placeholder="123 Health Ave, Suite 10" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"/>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="block font-bold uppercase text-[10px] text-slate-400">Emergency Contact <span class="text-rose-500">*</span></label>
                  <input type="text" name="emergency_contact_name" required placeholder="John Morgan" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"/>
                </div>
                <div class="space-y-1">
                  <label class="block font-bold uppercase text-[10px] text-slate-400">Emergency Phone <span class="text-rose-500">*</span></label>
                  <input type="tel" name="emergency_contact_phone" required placeholder="+1 (555) 999-8877" class="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"/>
                </div>
              </div>

              <button 
                type="submit" 
                class="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition-all hover:scale-[1.01] mt-2"
              >
                Complete Patient Registration
              </button>

            </form>
          `}
        </div>

      </div>
    </div>
  `;
}
