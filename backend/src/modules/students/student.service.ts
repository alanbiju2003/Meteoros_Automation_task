import { query } from "../../db/pool.js";
import type { z } from "zod";
import type { createStudentSchema, updateCardStatusSchema } from "./student.schemas.js";

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateCardStatusInput = z.infer<typeof updateCardStatusSchema>;

export async function listStudents() {
  const result = await query(
    `SELECT id, student_no AS "studentNo", full_name AS "fullName",
            department, year_level AS "yearLevel", nfc_uid AS "nfcUid",
            card_status AS "cardStatus", created_at AS "createdAt", updated_at AS "updatedAt"
     FROM students
     ORDER BY full_name ASC`
  );

  return result.rows;
}

export async function createStudent(input: CreateStudentInput) {
  const result = await query(
    `INSERT INTO students (student_no, full_name, department, year_level, nfc_uid, card_status)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'active'))
     RETURNING id, student_no AS "studentNo", full_name AS "fullName",
               department, year_level AS "yearLevel", nfc_uid AS "nfcUid",
               card_status AS "cardStatus", created_at AS "createdAt", updated_at AS "updatedAt"`,
    [
      input.studentNo,
      input.fullName,
      input.department,
      input.yearLevel,
      input.nfcUid,
      input.cardStatus
    ]
  );

  return result.rows[0];
}

export async function updateCardStatus(studentId: string, input: UpdateCardStatusInput) {
  const result = await query(
    `UPDATE students
     SET card_status = $2, updated_at = now()
     WHERE id = $1
     RETURNING id, student_no AS "studentNo", full_name AS "fullName",
               department, year_level AS "yearLevel", nfc_uid AS "nfcUid",
               card_status AS "cardStatus", updated_at AS "updatedAt"`,
    [studentId, input.cardStatus]
  );

  return result.rows[0] ?? null;
}
