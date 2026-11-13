/**
 * Backend API Diagnostics & Live/Demo Mode Switcher Modal
 */

import { store } from '../store.js';
import { api } from '../api.js';

export function renderApiSettingsModal(container) {
  if (!container) return;
  const { modals, backendStatus } = store.state;

  if (!modals.apiSettings) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div class="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        <!-- Header -->
        <div class="p-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <div>
              <h2 class="text-lg font-extrabold text-slate-900 dark:text-white">API Connection & Diagnostic Hub</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">Django REST Framework connectivity settings</p>
            </div>
          </div>
          <button 
            onclick="window.ApexStore.closeApiSettingsModal()"
            class="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-700 dark:text-slate-300">
          
          <!-- Backend Status Card -->
          <div class="p-4 rounded-2xl border ${
            backendStatus.online 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' 
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
          } flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="w-3 h-3 rounded-full ${
                backendStatus.online ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }"></span>
              <div>
                <p class="font-extrabold text-sm ${
                  backendStatus.online ? 'text-emerald-900 dark:text-emerald-200' : 'text-amber-900 dark:text-amber-200'
                }">
                  ${backendStatus.online ? 'Django Server Online (Reachable)' : 'Django Server Offline / Unreachable'}
                </p>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">
                  Target: <span class="font-mono">${api.baseUrl}</span>
                </p>
              </div>
            </div>

            <button 
              onclick="window.ApexPingBackend()" 
              class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold shadow-sm hover:scale-105 transition-all"
            >
              Test Ping 📡
            </button>
          </div>

          <!-- Operating Mode Selector -->
          <div class="space-y-2">
            <label class="block font-bold uppercase text-[10px] text-slate-400">Select Operating Mode</label>
            <div class="grid grid-cols-2 gap-3">
              <label class="p-3.5 rounded-2xl border cursor-pointer transition-all ${
                !backendStatus.liveMode 
                  ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 ring-2 ring-amber-500/20' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }">
                <input 
                  type="radio" 
                  name="api_mode" 
                  value="demo" 
                  ${!backendStatus.liveMode ? 'checked' : ''} 
                  onchange="window.ApexSetApiMode(false)"
                  class="hidden"
                />
                <p class="font-extrabold text-xs text-slate-900 dark:text-white">Presentation / Demo</p>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  100% interactive, zero setup required. Works offline with rich pre-seeded clinical data.
                </p>
              </label>

              <label class="p-3.5 rounded-2xl border cursor-pointer transition-all ${
                backendStatus.liveMode 
                  ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/30 ring-2 ring-teal-500/20' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }">
                <input 
                  type="radio" 
                  name="api_mode" 
                  value="live" 
                  ${backendStatus.liveMode ? 'checked' : ''} 
                  onchange="window.ApexSetApiMode(true)"
                  class="hidden"
                />
                <p class="font-extrabold text-xs text-slate-900 dark:text-white">Live Django REST API</p>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Sends live HTTP requests to your Django backend with TokenAuthentication.
                </p>
              </label>
            </div>
          </div>

          <!-- Endpoint Configuration -->
          <div class="space-y-2">
            <label class="block font-bold uppercase text-[10px] text-slate-400">Backend API URL</label>
            <div class="flex gap-2">
              <input 
                type="text" 
                id="api-url-input" 
                value="${api.baseUrl}"
                class="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button 
                onclick="window.ApexSaveApiUrl()"
                class="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors"
              >
                Save
              </button>
            </div>
          </div>

          <!-- How to run backend helper -->
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 space-y-2 text-[11px]">
            <p class="font-bold text-slate-800 dark:text-slate-200">How to launch Django Backend:</p>
            <pre class="bg-slate-900 text-teal-300 p-2.5 rounded-lg overflow-x-auto font-mono text-[10px]">
python manage.py migrate
python seed_data.py
python manage.py runserver 127.0.0.1:8000</pre>
            <p class="text-slate-500">The frontend will automatically synchronize in real time when the server starts.</p>
          </div>

        </div>

        <!-- Footer -->
        <div class="p-6 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-end bg-slate-50/50 dark:bg-slate-850/50">
          <button 
            onclick="window.ApexStore.closeApiSettingsModal()"
            class="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-sm"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  `;
}
