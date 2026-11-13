/**
 * Dynamic Sidebar Navigation Component
 */

import { store } from '../store.js';

export function renderSidebar(container) {
  if (!container) return;
  const { currentRole, activeTab, appointments } = store.state;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppts = (appointments || []).filter(a => a.appointment_date === todayStr);

  const navConfigs = {
    PATIENT: [
      { id: 'overview', label: 'My Dashboard', icon: 'layout-dashboard' },
      { id: 'appointments', label: 'My Appointments', icon: 'calendar', count: appointments.length },
      { id: 'book', label: 'Book Appointment', icon: 'plus-circle' },
      { id: 'doctors', label: 'Doctor Directory', icon: 'user-check' },
      { id: 'profile', label: 'Medical Profile', icon: 'file-text' },
    ],
    PROFESSIONAL: [
      { id: 'overview', label: 'Doctor Workspace', icon: 'activity' },
      { id: 'appointments', label: "Today's Schedule", icon: 'calendar-clock', count: todayAppts.length },
      { id: 'patients', label: 'Patient Roster', icon: 'users' },
      { id: 'schedule', label: 'My Hours & Status', icon: 'clock' },
    ],
    RECEPTIONIST: [
      { id: 'overview', label: 'Reception Hub', icon: 'inbox' },
      { id: 'appointments', label: 'Check-in Queue', icon: 'list-ordered', count: todayAppts.length },
      { id: 'doctors', label: 'Doctor Availability', icon: 'stethoscope' },
      { id: 'patients', label: 'Patient Directory', icon: 'users' },
      { id: 'book', label: 'Walk-in Booking', icon: 'user-plus' },
    ],
    ADMIN: [
      { id: 'overview', label: 'Executive Dashboard', icon: 'bar-chart-3' },
      { id: 'appointments', label: 'All Appointments', icon: 'calendar', count: appointments.length },
      { id: 'doctors', label: 'Manage Doctors', icon: 'stethoscope' },
      { id: 'patients', label: 'Patient Database', icon: 'folder-open' },
      { id: 'users', label: 'User Accounts', icon: 'shield' },
    ],
  };

  const navItems = navConfigs[currentRole] || navConfigs.PATIENT;

  const getSvgIcon = (iconName) => {
    switch (iconName) {
      case 'layout-dashboard':
      case 'bar-chart-3':
      case 'inbox':
      case 'activity':
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>`;
      case 'calendar':
      case 'calendar-clock':
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>`;
      case 'plus-circle':
      case 'user-plus':
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/>`;
      case 'user-check':
      case 'users':
      case 'stethoscope':
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>`;
      case 'file-text':
      case 'folder-open':
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>`;
      case 'shield':
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>`;
      default:
        return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>`;
    }
  };

  container.innerHTML = `
    <aside class="w-full lg:w-64 flex-shrink-0 flex flex-col justify-between py-6 px-3 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-colors">
      <div class="space-y-6">
        
        <!-- Role Header Card -->
        <div class="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
          <p class="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Current Workspace</p>
          <h2 class="text-sm font-extrabold text-slate-800 dark:text-white capitalize">${currentRole.toLowerCase()} Mode</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            ${store.state.currentUser?.first_name ? `${store.state.currentUser.first_name} ${store.state.currentUser.last_name}` : store.state.currentUser?.username}
          </p>
        </div>

        <!-- Navigation Links -->
        <nav class="space-y-1">
          ${navItems.map(item => {
            const isActive = activeTab === item.id;
            return `
              <button 
                onclick="${item.id === 'book' ? 'window.ApexStore.openBookingModal()' : `window.ApexStore.setActiveTab('${item.id}')`}"
                class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive 
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                }"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-4 h-4 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    ${getSvgIcon(item.icon)}
                  </svg>
                  <span>${item.label}</span>
                </div>
                ${item.count !== undefined ? `
                  <span class="px-2 py-0.5 text-[11px] font-bold rounded-full ${
                    isActive ? 'bg-teal-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }">
                    ${item.count}
                  </span>
                ` : ''}
              </button>
            `;
          }).join('')}
        </nav>

      </div>

      <!-- Emergency Helpline Widget -->
      <div class="mt-8 p-3.5 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-slate-800 dark:to-slate-850 border border-teal-100 dark:border-slate-700/80">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">24/7 Clinic Support</span>
        </div>
        <p class="text-xs font-medium text-slate-600 dark:text-slate-400">Emergencies or rapid ambulance dispatch:</p>
        <p class="text-sm font-extrabold text-teal-700 dark:text-teal-400 mt-1 font-mono">+1 (800) 555-APEX</p>
      </div>

    </aside>
  `;
}
