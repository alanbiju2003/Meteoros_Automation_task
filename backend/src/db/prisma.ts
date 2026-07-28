import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5440/campus_attendance?schema=public";
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new (PrismaClient as any)({ adapter });
