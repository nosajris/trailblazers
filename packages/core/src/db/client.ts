import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

export type AppSchema = typeof schema;
export type Database = PostgresJsDatabase<AppSchema>;

export function createDatabase(databaseUrl: string): { db: Database; sql: ReturnType<typeof postgres> } {
	const sql = postgres(databaseUrl, {
		max: 10,
		idle_timeout: 20,
		connect_timeout: 10
	});
	const db = drizzle(sql, { schema });
	return { db, sql };
}
