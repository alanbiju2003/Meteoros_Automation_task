import { Router } from 'express';
import { login } from '../controllers/auth.controller.js';
import { getDashboardStats, getDashboardCharts } from '../controllers/dashboard.controller.js';
import { getStudents, getStudentById, createStudent } from '../controllers/student.controller.js';
import { checkIn, checkOut, getAttendanceHistory } from '../controllers/attendance.controller.js';
import { recordLocationPing, getLatestLocations } from '../controllers/location.controller.js';
import { getActivityFeed } from '../controllers/activity.controller.js';
import { generateReport } from '../controllers/reports.controller.js';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { triggerScheduledCheckpoint } from '../controllers/scheduled.controller.js';
import { getClassSchedule } from '../controllers/schedule.controller.js';
import { getHealthCheck, runLoadSimulation } from '../controllers/health.controller.js';
import { sendSecurityAlertEmail, sendNightlyAuditReport } from '../controllers/alert.controller.js';
import {
  evaluateTelemetry,
  getHeatmapAndIncidents,
  getPredictions,
  getSystemHealthMetrics,
  requestManualAttendance,
} from '../controllers/cto.controller.js';
import {
  queryAIAssistant,
  getStudentBehaviorFingerprint,
  getRootCauseAnalysis,
} from '../controllers/aiAssistant.controller.js';

const router = Router();

// Health Check & Load Simulation Benchmark
router.get('/health', getHealthCheck);
router.post('/test/load-sim', runLoadSimulation);

// Security & Threat Email Alerts
router.post('/alerts/send-security-email', sendSecurityAlertEmail);
router.post('/alerts/nightly-audit-report', sendNightlyAuditReport);

// Auth routes
router.post('/auth/login', login);

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/charts', getDashboardCharts);

// Student routes
router.get('/students', getStudents);
router.post('/students', createStudent);
router.get('/students/:id', getStudentById);
router.get('/students/:id/fingerprint', getStudentBehaviorFingerprint);
router.get('/students/:id/root-cause', getRootCauseAnalysis);

// Attendance routes
router.post('/attendance/check-in', checkIn);
router.post('/attendance/check-out', checkOut);
router.get('/attendance/history', getAttendanceHistory);

// Class Timetable Schedule route
router.get('/schedule', getClassSchedule);

// Location / Telemetry routes (TimescaleDB)
router.post('/locations', recordLocationPing);
router.get('/locations/latest', getLatestLocations);

// Scheduled Checkpoint route (10 AM, 12 PM, 3 PM, 5 PM, 9 PM)
router.post('/scheduled/checkpoint', triggerScheduledCheckpoint);

// CTO Systems Thinking Endpoints
router.post('/telemetry/evaluate', evaluateTelemetry);
router.get('/analytics/heatmaps', getHeatmapAndIncidents);
router.get('/analytics/predictions', getPredictions);
router.get('/system/metrics', getSystemHealthMetrics);
router.post('/attendance/approval-request', requestManualAttendance);

// AI Natural Language Assistant Endpoint
router.post('/ai/query', queryAIAssistant);

// Activity feed route
router.get('/activity', getActivityFeed);

// Reports route
router.get('/reports', generateReport);

// Settings routes
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
