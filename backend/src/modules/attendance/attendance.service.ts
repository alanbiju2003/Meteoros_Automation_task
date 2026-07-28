import { query } from "../../db/pool.js";
import type { z } from "zod";
import type { attendanceQuerySchema, scanSchema } from "./attendance.schemas.js";
import { ApiError } from "../../middleware/errorHandler.js";

export type ScanInput = z.infer<typeof scanSchema>;
export type AttendanceQuery = z.infer<typeof attendanceQuerySchema>;

export async function recordScan(input: ScanInput, ipAddress?: string, userAgent?: string) {
  const studentResult = await query<{
    id: string;
    studentNo: string;
    fullName: string;
    cardStatus: string;
  }>(
    `SELECT id, student_no AS "studentNo", full_name AS "fullName", card_status AS "cardStatus"
     FROM students
     WHERE nfc_uid = $1`,
    [input.nfcUid]
  );

  const student = studentResult.rows[0];

  if (!student) {
    throw new ApiError(404, "NFC card is not registered");
  }

  const eventType = student.cardStatus === "active" ? input.eventType : "scan_denied";

  const eventResult = await query(
    `INSERT INTO attendance_events (
       student_id, event_type, latitude, longitude, accuracy_meters,
       device_id, reader_id, ip_address, user_agent, metadata
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::inet, $9, $10::jsonb)
     RETURNING id, event_type AS "eventType", occurred_at AS "occurredAt",
               latitude, longitude, accuracy_meters AS "accuracyMeters",
               device_id AS "deviceId", reader_id AS "readerId", metadata`,
    [
      student.id,
      eventType,
      input.latitude ?? null,
      input.longitude ?? null,
      input.accuracyMeters ?? null,
      input.deviceId ?? null,
      input.readerId ?? null,
      ipAddress ?? null,
      userAgent ?? null,
      JSON.stringify(input.metadata ?? {})
    ]
  );

  return {
    accepted: eventType !== "scan_denied",
    student,
    event: eventResult.rows[0]
  };
}

export async function listAttendanceEvents(filters: AttendanceQuery) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (filters.studentId) {
    values.push(filters.studentId);
    conditions.push(`ae.student_id = $${values.length}`);
  }

  if (filters.eventType) {
    values.push(filters.eventType);
    conditions.push(`ae.event_type = $${values.length}`);
  }

  if (filters.from) {
    values.push(filters.from);
    conditions.push(`ae.occurred_at >= $${values.length}`);
  }

  if (filters.to) {
    values.push(filters.to);
    conditions.push(`ae.occurred_at <= $${values.length}`);
  }

  values.push(filters.limit);
  const limitParam = `$${values.length}`;
  values.push(filters.offset);
  const offsetParam = `$${values.length}`;

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await query(
    `SELECT ae.id,
            ae.event_type AS "eventType",
            ae.occurred_at AS "occurredAt",
            ae.latitude,
            ae.longitude,
            ae.accuracy_meters AS "accuracyMeters",
            ae.device_id AS "deviceId",
            ae.reader_id AS "readerId",
            ae.ip_address AS "ipAddress",
            ae.user_agent AS "userAgent",
            ae.metadata,
            s.id AS "studentId",
            s.student_no AS "studentNo",
            s.full_name AS "fullName",
            s.department,
            s.year_level AS "yearLevel",
            s.card_status AS "cardStatus"
     FROM attendance_events ae
     JOIN students s ON s.id = ae.student_id
     ${whereClause}
     ORDER BY ae.occurred_at DESC
     LIMIT ${limitParam} OFFSET ${offsetParam}`,
    values
  );

  return result.rows;
}

export async function getAttendanceSummary() {
  const result = await query(
    `SELECT
       COUNT(*) FILTER (WHERE event_type = 'check_in' AND occurred_at >= now() - interval '24 hours') AS "checkIns24h",
       COUNT(*) FILTER (WHERE event_type = 'check_out' AND occurred_at >= now() - interval '24 hours') AS "checkOuts24h",
       COUNT(*) FILTER (WHERE event_type = 'scan_denied' AND occurred_at >= now() - interval '24 hours') AS "denied24h",
       COUNT(DISTINCT student_id) FILTER (WHERE occurred_at >= now() - interval '24 hours') AS "activeStudents24h",
       COUNT(*) AS "totalEvents"
     FROM attendance_events`
  );

  return result.rows[0];
}
