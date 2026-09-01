import dotenv from 'dotenv';
import path from 'node:path';
import { createDatabase } from '@trailblazers/core';

// Load .env from apps/web or root monorepo directory
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const databaseUrl =
	process.env.DATABASE_URL ||
	process.env.POSTGRES_URL ||
	process.env.POSTGRES_PRISMA_URL ||
	process.env.POSTGRES_URL_NON_POOLING;

export const LOCAL_FALLBACK_URL = 'postgresql://postgres:postgres@localhost:5432/trailblazers';

/**
 * Whether a connection string was actually supplied.
 *
 * The fallback below stays in place because this module is also evaluated
 * where no database is expected: SvelteKit imports server modules during the
 * build to read route options, and `npm run seed` loads it through vite-node.
 * `postgres()` is lazy, so an unused fallback never opens a socket.
 *
 * The production guard that used to be missing now lives in `hooks.server.ts`,
 * which only the running server loads — see the note there.
 */
export const isDatabaseUrlConfigured = Boolean(databaseUrl);

const { db, sql } = createDatabase(databaseUrl || LOCAL_FALLBACK_URL);

export { db, sql };
