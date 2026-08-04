import dotenv from 'dotenv';
import path from 'node:path';
import { createDatabase } from '@trailblazers/core';

// Load .env from apps/admin or root monorepo directory
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/trailblazers';
const { db, sql } = createDatabase(databaseUrl);

export { db, sql };
