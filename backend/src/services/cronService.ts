import { sendNightlyAuditReportHelper } from '../controllers/alert.controller.js';

export function startDailyNightlyAuditScheduler() {
  console.log('⏰ Starting Daily Nightly Audit Email Scheduler (Target: Every day at 21:00 IST)...');

  // Check every hour if current time in IST is 21:00 (9:00 PM)
  setInterval(async () => {
    try {
      const nowIST = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      });

      // Match 21:00 IST
      if (nowIST === '21:00' || nowIST === '21:01') {
        console.log('🌙 21:00 IST Reached! Executing Daily Automated Nightly Threat Audit Email Dispatch...');
        await sendNightlyAuditReportHelper('alanthomasbiju01@gmail.com');
      }
    } catch (error) {
      console.error('Error in daily audit scheduler:', error);
    }
  }, 60000); // Check every minute
}
