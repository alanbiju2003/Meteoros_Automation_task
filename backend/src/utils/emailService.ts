import nodemailer from 'nodemailer';

export const STAKEHOLDER_CC_EMAILS = [
  'itmealanbiju@gmail.com',
  'alanthomasbiju01@gmail.com',
];

const DEFAULT_TARGET_EMAIL = 'alanthomasbiju01@gmail.com';

const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || 'alanthomasbiju01@gmail.com';
  const pass = (process.env.SMTP_PASS || 'yiherwsflpbzmsmd').replace(/\s+/g, '');

  return nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: { user, pass },
  });
};

export const sendGeofenceAlertEmail = async ({
  studentName,
  rollNumber,
  department,
  distanceKm,
  batteryLevel,
  deviceModel,
  cityLocation,
}: {
  studentName: string;
  rollNumber: string;
  department: string;
  distanceKm: number;
  batteryLevel: number;
  deviceModel: string;
  cityLocation: string;
}) => {
  try {
    const transporter = getTransporter();

    // Format timestamp in Indian Standard Time (IST - Asia/Kolkata)
    const istTimestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'medium',
    }) + ' IST';

    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; }
    .container { max-width: 600px; background: #ffffff; margin: 0 auto; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: #991b1b; color: #ffffff; padding: 24px; text-align: center; }
    .header h2 { margin: 0; font-size: 20px; }
    .alert-badge { background-color: #ef4444; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; margin-top: 8px; }
    .body-content { padding: 24px; color: #334155; font-size: 14px; line-height: 1.6; }
    .risk-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 16px 0; border-radius: 4px; }
    .detail-row { display: flex; justify-content: space-between; border-bottom: 1px border-dashed #e2e8f0; padding: 8px 0; font-size: 13px; }
    .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🚨 AUTOMATED GEOFENCE SECURITY ALERT</h2>
      <div class="alert-badge">OUTSIDE CAMPUS GEOFENCE (${cityLocation.toUpperCase()})</div>
    </div>

    <div class="body-content">
      <p>Dear Campus Stakeholders,</p>
      <p>The SmartCampus Telemetry Engine detected a student active session logged from <strong>outside the campus geofence boundary</strong>.</p>

      <div class="risk-box">
        <strong>Geofence Violation Details:</strong><br/>
        Student logged in from <strong>${cityLocation} (${distanceKm} km away from Campus)</strong>.<br/>
        <span style="font-size: 12px; color: #dc2626;">Attendance confidence score reduced to 12% 🔴 (Location Discrepancy Flagged).</span>
      </div>

      <div style="background: #f1f5f9; padding: 12px; border-radius: 8px; margin-top: 16px;">
        <div class="detail-row"><strong>Student Name:</strong> <span>${studentName}</span></div>
        <div class="detail-row"><strong>Roll Number:</strong> <span>${rollNumber}</span></div>
        <div class="detail-row"><strong>Department:</strong> <span>${department}</span></div>
        <div class="detail-row"><strong>Registered Device:</strong> <span>${deviceModel}</span></div>
        <div class="detail-row"><strong>Real Device Battery:</strong> <span style="color: #d97706; font-weight: bold;">${batteryLevel}% ⚡</span></div>
        <div class="detail-row"><strong>Timestamp (IST):</strong> <span style="color: #0284c7; font-weight: bold;">${istTimestamp}</span></div>
        <div class="detail-row"><strong>Stakeholder CC List:</strong> <span>${STAKEHOLDER_CC_EMAILS.join(', ')}</span></div>
      </div>
    </div>

    <div class="footer">
      Automated Real-Time Telemetry Alert Dispatch — SmartCampus AI Engine<br/>
      SmartCampus Institute of Technology — Academic Integrity & Security
    </div>
  </div>
</body>
</html>
`;

    const info = await transporter.sendMail({
      from: '"SmartCampus Security Engine" <alanthomasbiju01@gmail.com>',
      to: DEFAULT_TARGET_EMAIL,
      cc: STAKEHOLDER_CC_EMAILS,
      subject: `🚨 [GEOFENCE ALERT] Student ${studentName} (${rollNumber}) Logged in from ${cityLocation} (${distanceKm} km away)`,
      html: htmlTemplate,
    });

    console.log(`✅ Automatic Gmail Geofence Alert (IST Timestamp: ${istTimestamp}) sent to ${DEFAULT_TARGET_EMAIL} & CC ${STAKEHOLDER_CC_EMAILS.length} Stakeholders! Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Error sending automatic geofence email:', error);
    return false;
  }
};
