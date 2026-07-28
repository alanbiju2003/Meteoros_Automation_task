import { z } from "zod";

export const createStudentSchema = z.object({
  studentNo: z.string().min(2).max(50),
  fullName: z.string().min(2).max(120),
  department: z.string().min(2).max(120),
  yearLevel: z.number().int().min(1).max(6),
  nfcUid: z.string().min(4).max(120),
  cardStatus: z.enum(["active", "blocked", "lost", "inactive"]).optional()
});

export const updateCardStatusSchema = z.object({
  cardStatus: z.enum(["active", "blocked", "lost", "inactive"])
});
