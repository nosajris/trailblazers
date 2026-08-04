import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

export type AppSchema = typeof schema;
export type Database = PostgresJsDatabase<AppSchema>;

export function createDatabase(databaseUrl: string): { db: Database; sql: ReturnType<typeof postgres> } {
	const isServerless = Boolean(process.env.VERCEL || process.env.LAMBDA_TASK_ROOT);

	const sql = postgres(databaseUrl, {
		max: isServerless ? 1 : 10,
		idle_timeout: 20,
		connect_timeout: 10,
		prepare: false // Essential for PgBouncer / Vercel Serverless database poolers
	});

	const db = drizzle(sql, { schema });
	return { db, sql };
}
