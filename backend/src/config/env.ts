import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5005),
  DATABASE_URL: z.string().default("postgres://postgres:postgres@localhost:5432/nfc_campus"),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  ADMIN_API_KEY: z.string().default("change-this-admin-key"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().default(120)
});

export const env = envSchema.parse(process.env);
