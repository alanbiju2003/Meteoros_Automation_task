const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5005";
const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY ?? "change-this-admin-key";

export type AttendanceEvent = {
  id: string;
  eventType: "check_in" | "check_out" | "scan_denied";
  occurredAt: string;
  latitude: number | null;
  longitude: number | null;
  accuracyMeters: number | null;
  deviceId: string | null;
  readerId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown>;
  studentId: string;
  studentNo: string;
  fullName: string;
  department: string;
  yearLevel: number;
  cardStatus: string;
};

export type Student = {
  id: string;
  studentNo: string;
  fullName: string;
  department: string;
  yearLevel: number;
  nfcUid: string;
  cardStatus: "active" | "blocked" | "lost" | "inactive";
};

export type Summary = {
  checkIns24h: string;
  checkOuts24h: string;
  denied24h: string;
  activeStudents24h: string;
  totalEvents: string;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    }
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error ?? `Request failed with ${response.status}`);
  }

  return payload.data;
}

export function recordScan(body: {
  nfcUid: string;
  eventType: "check_in" | "check_out";
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  deviceId?: string;
  readerId?: string;
  metadata?: Record<string, unknown>;
}) {
  return request("/api/attendance/scan", {
    method: "POST",
    body: JSON.stringify(body)
  });
}

export function getAttendanceEvents() {
  return request<AttendanceEvent[]>("/api/admin/attendance?limit=200", {
    headers: { "x-admin-api-key": ADMIN_API_KEY }
  });
}

export function getAttendanceSummary() {
  return request<Summary>("/api/admin/attendance/summary", {
    headers: { "x-admin-api-key": ADMIN_API_KEY }
  });
}

export function getStudents() {
  return request<Student[]>("/api/admin/students", {
    headers: { "x-admin-api-key": ADMIN_API_KEY }
  });
}
