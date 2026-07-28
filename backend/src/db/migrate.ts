import { pool } from "./pool.js";

const statements = [
  `CREATE EXTENSION IF NOT EXISTS timescaledb`,
  `CREATE EXTENSION IF NOT EXISTS pgcrypto`,
  `CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_no TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    department TEXT NOT NULL,
    year_level INTEGER NOT NULL CHECK (year_level BETWEEN 1 AND 6),
    nfc_uid TEXT UNIQUE NOT NULL,
    card_status TEXT NOT NULL DEFAULT 'active' CHECK (card_status IN ('active', 'blocked', 'lost', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS attendance_events (
    id UUID DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('check_in', 'check_out', 'scan_denied')),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    accuracy_meters DOUBLE PRECISION,
    device_id TEXT,
    reader_id TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    PRIMARY KEY (id, occurred_at)
  )`,
  `SELECT create_hypertable('attendance_events', 'occurred_at', if_not_exists => TRUE)`,
  `CREATE INDEX IF NOT EXISTS idx_students_nfc_uid ON students (nfc_uid)`,
  `CREATE INDEX IF NOT EXISTS idx_attendance_student_time ON attendance_events (student_id, occurred_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_attendance_event_time ON attendance_events (event_type, occurred_at DESC)`
];

async function migrate() {
  for (const statement of statements) {
    await pool.query(statement);
  }

  await pool.end();
  console.log("Database migrated successfully");
}

migrate().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
