import { z } from "zod";

export const scanSchema = z.object({
  nfcUid: z.string().min(4).max(120),
  eventType: z.enum(["check_in", "check_out"]),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  accuracyMeters: z.number().min(0).max(10000).optional(),
  deviceId: z.string().max(120).optional(),
  readerId: z.string().max(120).optional(),
  metadata: z.record(z.unknown()).optional()
});

export const attendanceQuerySchema = z.object({
  studentId: z.string().uuid().optional(),
  eventType: z.enum(["check_in", "check_out", "scan_denied"]).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(500).default(100),
  offset: z.coerce.number().int().min(0).default(0)
});
