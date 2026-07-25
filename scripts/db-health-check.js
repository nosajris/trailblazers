import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	console.error('❌ [DB Health Check] Failed: DATABASE_URL is not set.');
	process.exit(1);
}

console.log('🔍 [DB Health Check] Connecting to database...');

const sql = postgres(connectionString, { max: 1, timeout: 10 });

async function checkDatabaseHealth() {
	try {
		const result = await sql`SELECT 1 as alive, current_database(), version()`;
		console.log('✅ [DB Health Check] Database connection successful!');
		console.log(`ℹ️ [DB Health Check] Connected DB: ${result[0].current_database}`);
		console.log(`ℹ️ [DB Health Check] PostgreSQL Version: ${result[0].version}`);

		// Query table count to verify migrations executed cleanly
		const tables = await sql`
			SELECT count(*) as count 
			FROM information_schema.tables 
			WHERE table_schema = 'public'
		`;
		console.log(`📊 [DB Health Check] Active Public Tables Count: ${tables[0].count}`);

		await sql.end();
		process.exit(0);
	} catch (error) {
		console.error('❌ [DB Health Check] Database check failed:', error);
		await sql.end();
		process.exit(1);
	}
}

checkDatabaseHealth();
