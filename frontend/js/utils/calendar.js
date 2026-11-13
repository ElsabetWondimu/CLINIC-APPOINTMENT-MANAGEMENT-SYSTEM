/**
 * iCalendar (.ics) export and printable appointment pass utilities
 */
import { formatTime, formatDate } from './formatters.js';

export function downloadIcsFile(appointment, doctorName, patientName) {
  try {
    const dateStr = appointment.appointment_date.replace(/-/g, '');
    const timeParts = (appointment.appointment_time || '09:00:00').split(':');
    const startHour = timeParts[0].padStart(2, '0');
    const startMin = timeParts[1].padStart(2, '0');
    
    // Estimate 45 min duration
    let endH = parseInt(startHour, 10);
    let endM = parseInt(startMin, 10) + 45;
    if (endM >= 60) {
      endH += 1;
      endM -= 60;
    }
    const endHour = String(endH).padStart(2, '0');
    const endMin = String(endM).padStart(2, '0');

    const dtStart = `${dateStr}T${startHour}${startMin}00`;
    const dtEnd = `${dateStr}T${endHour}${endMin}00`;
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//ApexCare Medical Clinic//Appointment Scheduler//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${appointment.appointment_id || Date.now()}@apexcare.health`,
      `DTSTAMP:${now}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:Medical Appointment with Dr. ${doctorName}`,
      `DESCRIPTION:Clinic Appointment for ${patientName}. Reason: ${appointment.reason || 'Consultation'}. Status: ${appointment.status}`,
      'LOCATION:ApexCare Medical Center, Suite 400, 100 Health Sciences Way',
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT2H',
      'DESCRIPTION:Reminder: ApexCare Clinic Appointment in 2 hours',
      'ACTION:DISPLAY',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Appointment-Dr-${doctorName.replace(/\s+/g, '_')}-${appointment.appointment_date}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to generate ICS file:', err);
    alert('Could not generate calendar file. Please try again.');
  }
}

export function printAppointmentPass(appointment, doctor, patient) {
  const container = document.getElementById('printable-slip');
  if (!container) return;

  const doctorName = doctor?.name || (doctor?.user ? `Dr. ${doctor.user.first_name || ''} ${doctor.user.last_name || doctor.user.username}` : 'Doctor');
  const patientName = patient?.name || (patient?.user ? `${patient.user.first_name || ''} ${patient.user.last_name || patient.user.username}` : 'Patient');

  container.innerHTML = `
    <div style="max-width: 650px; margin: 0 auto; border: 2px dashed #0d9488; padding: 32px; border-radius: 12px; font-family: sans-serif; color: #1e293b;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0d9488; padding-bottom: 16px; margin-bottom: 24px;">
        <div>
          <h1 style="margin: 0; color: #0d9488; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">APEXCARE HEALTH CLINIC</h1>
          <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Official Digital Appointment & Check-In Pass</p>
        </div>
        <div style="text-align: right;">
          <span style="display: inline-block; background: #f0fdfa; border: 1px solid #99f6e4; color: #0f766e; font-size: 12px; font-weight: bold; padding: 4px 12px; border-radius: 9999px;">
            ${appointment.status || 'CONFIRMED'}
          </span>
          <p style="margin: 4px 0 0; font-family: monospace; font-size: 11px; color: #94a3b8;">
            ID: ${appointment.appointment_id ? appointment.appointment_id.substring(0, 8).toUpperCase() : 'PENDING'}
          </p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h3 style="margin: 0 0 8px; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Patient Details</h3>
          <p style="margin: 0 0 4px; font-size: 16px; font-weight: bold; color: #0f172a;">${patientName}</p>
          <p style="margin: 0 0 4px; font-size: 13px; color: #475569;">Contact: ${patient?.phone_number || 'N/A'}</p>
          <p style="margin: 0; font-size: 12px; color: #64748b;">Emergency Contact: ${patient?.emergency_contact_name || 'N/A'} (${patient?.emergency_contact_phone || 'N/A'})</p>
        </div>

        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h3 style="margin: 0 0 8px; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">Attending Physician</h3>
          <p style="margin: 0 0 4px; font-size: 16px; font-weight: bold; color: #0f172a;">${doctorName}</p>
          <p style="margin: 0 0 4px; font-size: 13px; color: #0d9488; font-weight: 500;">Specialty: ${doctor?.specialty || 'General Medicine'}</p>
          <p style="margin: 0; font-size: 12px; color: #64748b;">Qualifications: ${doctor?.qualifications || 'MD'}</p>
        </div>
      </div>

      <div style="background: #f0fdfa; border: 1px solid #ccfbf1; padding: 18px; border-radius: 8px; margin-bottom: 24px; text-align: center;">
        <div style="display: flex; justify-content: space-around; align-items: center;">
          <div>
            <div style="font-size: 12px; color: #0f766e; text-transform: uppercase; font-weight: 600;">Date</div>
            <div style="font-size: 18px; font-weight: bold; color: #134e4a; margin-top: 4px;">${formatDate(appointment.appointment_date)}</div>
          </div>
          <div style="width: 1px; height: 36px; background: #99f6e4;"></div>
          <div>
            <div style="font-size: 12px; color: #0f766e; text-transform: uppercase; font-weight: 600;">Scheduled Time</div>
            <div style="font-size: 18px; font-weight: bold; color: #134e4a; margin-top: 4px;">${formatTime(appointment.appointment_time)}</div>
          </div>
          <div style="width: 1px; height: 36px; background: #99f6e4;"></div>
          <div>
            <div style="font-size: 12px; color: #0f766e; text-transform: uppercase; font-weight: 600;">Est. Fee</div>
            <div style="font-size: 18px; font-weight: bold; color: #134e4a; margin-top: 4px;">$${doctor?.consultation_fee || '50.00'}</div>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 24px;">
        <h4 style="margin: 0 0 6px; font-size: 13px; color: #334155;">Reason for Visit:</h4>
        <p style="margin: 0; font-size: 14px; color: #475569; background: #f8fafc; padding: 10px 14px; border-radius: 6px; border: 1px solid #e2e8f0;">
          ${appointment.reason || 'General Medical Consultation'}
        </p>
      </div>

      <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #94a3b8;">
        <div>
          <p style="margin: 0;">📍 ApexCare Medical Center - 100 Health Sciences Way, Tower B, Level 4</p>
          <p style="margin: 2px 0 0;">Please arrive 10 minutes prior to scheduled time with valid photo ID.</p>
        </div>
        <div style="text-align: right; font-family: monospace;">
          [APEX-VERIFIED-PASS]
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    window.print();
  }, 150);
}
