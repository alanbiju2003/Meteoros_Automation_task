import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { attendanceQuerySchema, scanSchema } from "./attendance.schemas.js";
import { getAttendanceSummary, listAttendanceEvents, recordScan } from "./attendance.service.js";
import { scanRateLimiter } from "../../middleware/rateLimit.js";

export const publicAttendanceRouter = Router();
export const adminAttendanceRouter = Router();

publicAttendanceRouter.post(
  "/scan",
  scanRateLimiter,
  asyncHandler(async (req, res) => {
    const result = await recordScan(scanSchema.parse(req.body), req.ip, req.header("user-agent"));
    res.status(result.accepted ? 201 : 403).json({ data: result });
  })
);

adminAttendanceRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const events = await listAttendanceEvents(attendanceQuerySchema.parse(req.query));
    res.json({ data: events });
  })
);

adminAttendanceRouter.get(
  "/summary",
  asyncHandler(async (_req, res) => {
    res.json({ data: await getAttendanceSummary() });
  })
);
