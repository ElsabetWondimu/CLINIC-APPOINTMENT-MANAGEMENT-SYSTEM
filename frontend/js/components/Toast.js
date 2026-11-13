/**
 * Modern Floating Toast Notification Component
 */

import { store } from '../store.js';

export function renderToasts(container) {
  if (!container) return;
  const toasts = store.state.toasts || [];

  if (toasts.length === 0) {
    container.innerHTML = '';
    return;
  }

  const icons = {
    success: `
      <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    `,
    error: `
      <svg class="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    `,
    info: `
      <svg class="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    `,
    warning: `
      <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>
    `,
  };

  const borders = {
    success: 'border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-900',
    error: 'border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900',
    info: 'border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-900',
    warning: 'border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-900',
  };

  container.innerHTML = `
    <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-4">
      ${toasts.map(t => `
        <div class="pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-xl border ${borders[t.type] || borders.info} animate-slide-down transition-all duration-300">
          <div class="flex items-center gap-3">
            ${icons[t.type] || icons.info}
            <span class="text-sm font-medium text-slate-800 dark:text-slate-100">${t.message}</span>
          </div>
          <button onclick="window.ApexStore.removeToast('${t.id}')" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      `).join('')}
    </div>
  `;
}
