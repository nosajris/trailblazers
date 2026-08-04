import dotenv from 'dotenv';
import path from 'node:path';
import { createDatabase } from '@trailblazers/core';

// Load .env from apps/admin or root monorepo directory
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const databaseUrl =
	process.env.DATABASE_URL ||
	process.env.POSTGRES_URL ||
	process.env.POSTGRES_PRISMA_URL ||
	process.env.POSTGRES_URL_NON_POOLING;

if (!databaseUrl && process.env.NODE_ENV === 'production') {
	console.error('[DB Error] Missing DATABASE_URL / POSTGRES_URL environment variable in production deployment.');
}

const finalDatabaseUrl = databaseUrl || 'postgresql://postgres:postgres@localhost:5432/trailblazers';
const { db, sql } = createDatabase(finalDatabaseUrl);

export { db, sql };
