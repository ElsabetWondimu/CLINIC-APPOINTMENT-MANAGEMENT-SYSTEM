/**
 * Lightweight SVG Chart Utilities for Clinic Analytics
 */

export function renderBarChart(container, data, options = {}) {
  if (!container || !data || data.length === 0) return;
  
  const width = options.width || 480;
  const height = options.height || 220;
  const padding = { top: 20, right: 20, bottom: 35, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  
  const maxVal = Math.max(...data.map(d => d.value), 5);
  const barWidth = Math.min(36, (chartW / data.length) * 0.55);
  const step = chartW / data.length;
  
  const barsSvg = data.map((d, i) => {
    const barH = (d.value / maxVal) * chartH;
    const x = padding.left + i * step + (step - barWidth) / 2;
    const y = padding.top + chartH - barH;
    
    return `
      <g class="chart-bar-group" data-label="${d.label}" data-value="${d.value}">
        <rect 
          x="${x}" 
          y="${y}" 
          width="${barWidth}" 
          height="${barH}" 
          rx="5" 
          fill="url(#barGradient)" 
          class="transition-all duration-300 hover:opacity-80 cursor-pointer"
        >
          <title>${d.label}: ${d.value} visits</title>
        </rect>
        <text 
          x="${x + barWidth / 2}" 
          y="${y - 6}" 
          text-anchor="middle" 
          font-size="11" 
          font-weight="600" 
          fill="#0f766e"
        >${d.value}</text>
        <text 
          x="${x + barWidth / 2}" 
          y="${height - 12}" 
          text-anchor="middle" 
          font-size="11" 
          fill="#64748b" 
          font-weight="500"
        >${d.label}</text>
      </g>
    `;
  }).join('');

  // Horizontal grid lines
  const gridLines = [0, 0.5, 1].map(ratio => {
    const y = padding.top + chartH - ratio * chartH;
    const val = Math.round(ratio * maxVal);
    return `
      <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e2e8f0" stroke-dasharray="3 3" />
      <text x="${padding.left - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="#94a3b8">${val}</text>
    `;
  }).join('');

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto overflow-visible select-none">
      <defs>
        <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0d9488" />
          <stop offset="100%" stop-color="#14b8a6" stop-opacity="0.75" />
        </linearGradient>
      </defs>
      ${gridLines}
      ${barsSvg}
    </svg>
  `;
}

export function renderDonutChart(container, slices, options = {}) {
  if (!container || !slices || slices.length === 0) return;

  const size = options.size || 220;
  const radius = size / 2;
  const strokeWidth = options.strokeWidth || 32;
  const innerRadius = radius - strokeWidth / 2;
  const circumference = 2 * Math.PI * innerRadius;
  
  const total = slices.reduce((acc, s) => acc + s.value, 0) || 1;
  let accumulatedPercent = 0;

  const circles = slices.map((slice, i) => {
    const percent = slice.value / total;
    const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
    const strokeDashoffset = -circumference * accumulatedPercent;
    accumulatedPercent += percent;

    return `
      <circle 
        cx="${radius}" 
        cy="${radius}" 
        r="${innerRadius}" 
        fill="transparent" 
        stroke="${slice.color}" 
        stroke-width="${strokeWidth}" 
        stroke-dasharray="${strokeDasharray}" 
        stroke-dashoffset="${strokeDashoffset}" 
        class="transition-all duration-500 hover:opacity-85 cursor-pointer"
      >
        <title>${slice.label}: ${slice.value} (${Math.round(percent * 100)}%)</title>
      </circle>
    `;
  }).join('');

  const legendHtml = slices.map(s => `
    <div class="flex items-center justify-between text-xs py-1">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${s.color};"></span>
        <span class="font-medium text-slate-700 dark:text-slate-300">${s.label}</span>
      </div>
      <span class="font-bold text-slate-900 dark:text-white">${s.value} <span class="text-slate-400 font-normal">(${Math.round((s.value / total) * 100)}%)</span></span>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="flex flex-col sm:flex-row items-center gap-6 justify-around w-full">
      <div class="relative w-[${size}px] h-[${size}px] flex-shrink-0">
        <svg width="${size}" height="${size}" class="transform -rotate-90">
          ${circles}
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span class="text-2xl font-extrabold text-slate-800 dark:text-white">${total}</span>
          <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total</span>
        </div>
      </div>
      <div class="w-full max-w-[200px]">
        ${legendHtml}
      </div>
    </div>
  `;
}
