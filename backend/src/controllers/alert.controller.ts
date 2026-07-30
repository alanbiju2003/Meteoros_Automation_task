import { Request, Response } from 'express';
import { prisma } from '../db/prisma.js';
import nodemailer from 'nodemailer';

const DEFAULT_CC_EMAIL = 'alanthomasbiju01@gmail.com';

export const sendSecurityAlertEmail = async (req: Request, res: Response) => {
  const { studentName, rollNumber, riskType, details, recipientEmail, ccEmail } = req.body;

  const targetEmail = recipientEmail || 'alanthomasbiju01@gmail.com';
  const targetCc = ccEmail || DEFAULT_CC_EMAIL;

  const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; }
    .container { max-width: 600px; background: #ffffff; margin: 0 auto; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: #0f172a; color: #ffffff; padding: 24px; text-align: center; }
    .header h2 { margin: 0; font-size: 20px; letter-spacing: 0.5px; }
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
      <h2>🛡️ SMARTCAMPUS SECURITY THREAT ALERT</h2>
      <div class="alert-badge">HIGH RISK SECURITY INCIDENT</div>
    </div>

    <div class="body-content">
      <p>Dear Campus Stakeholder / Security Officer,</p>
      <p>The SmartCampus Automated AI Telemetry Engine has flagged a potential attendance spoofing and security violation on campus.</p>

      <div class="risk-box">
        <strong>Incident Flagged:</strong> ${riskType || 'GPS Spoofing & Teleportation Anomaly'}<br/>
        <span style="font-size: 12px; color: #dc2626;">${details || 'Student position jumped >150 km/h between location pings. Mock location API enabled.'}</span>
      </div>

      <div style="background: #f1f5f9; padding: 12px; border-radius: 8px; margin-top: 16px;">
        <div class="detail-row"><strong>Student Name:</strong> <span>${studentName || 'Aarav Sharma'}</span></div>
        <div class="detail-row"><strong>Roll Number:</strong> <span>${rollNumber || 'CSE2023001'}</span></div>
        <div class="detail-row"><strong>Department:</strong> <span>Computer Science & Engineering</span></div>
        <div class="detail-row"><strong>CC Recipient:</strong> <span>${targetCc}</span></div>
        <div class="detail-row"><strong>Timestamp:</strong> <span>${new Date().toLocaleString()}</span></div>
        <div class="detail-row"><strong>Detection Status:</strong> <span style="color: #ef4444; font-weight: bold;">FLAGGED FOR REGISTRAR REVIEW</span></div>
      </div>

      <p style="margin-top: 20px;"><strong>Actionable Recommendations:</strong></p>
      <ul>
        <li>Verify student physical presence in ongoing lecture.</li>
        <li>Request device hardware inspection for third-party mock location apps.</li>
      </ul>
    </div>

    <div class="footer">
      This is an automated security dispatch from SmartCampus AI Telemetry Engine.<br/>
      Meteoros Institute of Technology — Office of Academic Integrity & Security
    </div>
  </div>
</body>
</html>
`;

  try {
    let emailPreviewUrl: string | boolean = false;

    // 1. If SMTP env credentials exist, send via real SMTP server
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: '"SmartCampus Security Engine" <alerts@college.edu>',
        to: targetEmail,
        cc: targetCc,
        subject: `🚨 [SECURITY ALERT] High-Risk Attendance Spoofing Incident - ${studentName || 'Student'} (${rollNumber || 'CSE2023001'})`,
        html: htmlTemplate,
      });
    } else {
      // 2. Dynamic Ethereal test account for instant live email delivery URL
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const info = await transporter.sendMail({
        from: '"SmartCampus Security Engine" <alerts@college.edu>',
        to: targetEmail,
        cc: targetCc,
        subject: `🚨 [SECURITY ALERT] High-Risk Attendance Spoofing Incident - ${studentName || 'Student'} (${rollNumber || 'CSE2023001'})`,
        html: htmlTemplate,
      });

      emailPreviewUrl = nodemailer.getTestMessageUrl(info) || false;
    }

    return res.json({
      status: 'SUCCESS',
      message: `Security Alert Email dispatched to ${targetEmail} (CC: ${targetCc})`,
      recipientEmail: targetEmail,
      ccEmail: targetCc,
      emailPreviewUrl,
      incidentId: `SEC-INC-${Date.now()}`,
      htmlPreview: htmlTemplate,
    });
  } catch (error) {
    console.error('Error sending security email:', error);
    return res.status(500).json({ message: 'Failed to send security email alert' });
  }
};

export const sendNightlyAuditReport = async (req: Request, res: Response) => {
  const { recipientEmail, ccEmail } = req.body;

  const targetEmail = recipientEmail || 'alanthomasbiju01@gmail.com';
  const targetCc = ccEmail || DEFAULT_CC_EMAIL;

  const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f9; margin: 0; padding: 20px; }
    .container { max-width: 650px; background: #ffffff; margin: 0 auto; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background: #0f172a; color: #ffffff; padding: 24px; text-align: center; }
    .summary-grid { display: flex; background: #1e293b; color: white; padding: 16px; justify-content: space-around; text-align: center; font-size: 12px; }
    .stat-num { font-size: 20px; font-weight: bold; color: #38bdf8; }
    .body-content { padding: 24px; color: #334155; font-size: 13px; line-height: 1.6; }
    .table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 12px; }
    .table th, .table td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
    .table th { background-color: #f1f5f9; font-weight: bold; }
    .badge-high { background: #ef4444; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
    .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin:0;">🌙 NIGHTLY EXECUTIVE THREAT & AUDIT REPORT</h2>
      <p style="margin:4px 0 0 0; font-size:12px; color: #94a3b8;">Automated Daily Attendance Integrity Summary</p>
    </div>

    <div class="summary-grid">
      <div><div class="stat-num">100</div>Total Active Students</div>
      <div><div class="stat-num">88.4%</div>Campus Attendance</div>
      <div><div class="stat-num" style="color:#f43f5e;">2</div>Fishy / Flagged Students</div>
    </div>

    <div class="body-content">
      <p>Respected Dean & Academic Stakeholders,</p>
      <p>Here is the nightly summary report of students flagged for suspicious location activity or attendance anomalies today (<strong>${new Date().toLocaleDateString()}</strong>):</p>

      <table class="table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Roll Number</th>
            <th>Flagged Anomaly / Reason</th>
            <th>Risk Level</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Aarav Sharma</strong></td>
            <td>CSE2023001</td>
            <td>GPS Teleportation Speed Anomaly (>180 km/h jump)</td>
            <td><span class="badge-high">HIGH RISK</span></td>
          </tr>
          <tr>
            <td><strong>Rohan Gupta</strong></td>
            <td>ECE2023014</td>
            <td>Multi-Device Concurrent Login (iPhone + Laptop)</td>
            <td><span class="badge-high">HIGH RISK</span></td>
          </tr>
        </tbody>
      </table>

      <p style="margin-top: 16px;">CC Stakeholder Copy Delivered to: <strong>${targetCc}</strong></p>
      <p>All flagged incidents have been recorded in the TimescaleDB hypertable for administrative review.</p>
    </div>

    <div class="footer">
      Automated Nightly Email Dispatch — SmartCampus Security Engine<br/>
      Meteoros Institute of Technology
    </div>
  </div>
</body>
</html>
`;

  try {
    let emailPreviewUrl: string | boolean = false;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: '"SmartCampus Audit System" <reports@college.edu>',
        to: targetEmail,
        cc: targetCc,
        subject: `📊 [NIGHTLY AUDIT] Daily Attendance & Security Integrity Summary - ${new Date().toLocaleDateString()}`,
        html: htmlTemplate,
      });
    } else {
      const testAccount = await nodemailer.createTestAccount();
      const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const info = await transporter.sendMail({
        from: '"SmartCampus Audit System" <reports@college.edu>',
        to: targetEmail,
        cc: targetCc,
        subject: `📊 [NIGHTLY AUDIT] Daily Attendance & Security Integrity Summary - ${new Date().toLocaleDateString()}`,
        html: htmlTemplate,
      });

      emailPreviewUrl = nodemailer.getTestMessageUrl(info) || false;
    }

    return res.json({
      status: 'SUCCESS',
      message: `Nightly Threat & Audit Email Report dispatched to ${targetEmail} (CC: ${targetCc})`,
      recipientEmail: targetEmail,
      ccEmail: targetCc,
      emailPreviewUrl,
      reportDate: new Date().toISOString().split('T')[0],
      htmlPreview: htmlTemplate,
    });
  } catch (error) {
    console.error('Error sending nightly audit report:', error);
    return res.status(500).json({ message: 'Failed to send nightly audit report' });
  }
};
