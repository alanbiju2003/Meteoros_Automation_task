import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../middleware/errorHandler.js";
import { createStudentSchema, updateCardStatusSchema } from "./student.schemas.js";
import { createStudent, listStudents, updateCardStatus } from "./student.service.js";

export const studentRouter = Router();

studentRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json({ data: await listStudents() });
  })
);

studentRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const student = await createStudent(createStudentSchema.parse(req.body));
    res.status(201).json({ data: student });
  })
);

studentRouter.patch(
  "/:studentId/card-status",
  asyncHandler(async (req, res) => {
    const student = await updateCardStatus(String(req.params.studentId), updateCardStatusSchema.parse(req.body));

    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    res.json({ data: student });
  })
);
