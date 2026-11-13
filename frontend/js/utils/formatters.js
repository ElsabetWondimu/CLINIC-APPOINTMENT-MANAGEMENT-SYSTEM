/**
 * Formatting and Helper Utilities for Clinic Appointment Management System
 */

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const target = new Date(d);
    target.setHours(0, 0, 0, 0);
    
    const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));
    
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    const formatted = d.toLocaleDateString('en-US', options);
    
    if (diffDays === 0) return `Today (${formatted})`;
    if (diffDays === 1) return `Tomorrow (${formatted})`;
    if (diffDays === -1) return `Yesterday (${formatted})`;
    
    return formatted;
  } catch (e) {
    return dateStr;
  }
}

export function formatTime(timeStr) {
  if (!timeStr) return '—';
  try {
    // Handle "HH:MM:SS" or "HH:MM"
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12
    return `${hours}:${minutes} ${ampm}`;
  } catch (e) {
    return timeStr;
  }
}

export function formatCurrency(amount) {
  const num = parseFloat(amount);
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

export function getStatusBadge(status) {
  const norm = (status || '').toUpperCase();
  switch (norm) {
    case 'CONFIRMED':
      return {
        label: 'Confirmed',
        class: 'badge-confirmed',
        dot: 'bg-emerald-500',
        icon: 'check-circle-2',
      };
    case 'COMPLETED':
      return {
        label: 'Completed',
        class: 'badge-completed',
        dot: 'bg-purple-500',
        icon: 'badge-check',
      };
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        class: 'badge-cancelled',
        dot: 'bg-rose-500',
        icon: 'x-circle',
      };
    case 'SCHEDULED':
    default:
      return {
        label: 'Scheduled',
        class: 'badge-scheduled',
        dot: 'bg-sky-500',
        icon: 'clock',
      };
  }
}

export function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getAvatarColor(name) {
  const colors = [
    'from-teal-500 to-emerald-600',
    'from-blue-500 to-cyan-600',
    'from-indigo-500 to-blue-600',
    'from-violet-500 to-purple-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

export function playAudioFeedback(type = 'success') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    }
  } catch (e) {
    // Audio context may be blocked before first user gesture
  }
}
