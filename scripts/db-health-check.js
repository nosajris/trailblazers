import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	console.log('⚠️ [DB Health] DATABASE_URL is not set — skipping health check');
	process.exit(0);
}

// Reject obvious placeholder URLs
if (connectionString.includes('username:password') || connectionString.includes('user:pass')) {
	console.error('❌ [DB Health] DATABASE_URL contains placeholder credentials');
	process.exit(1);
}

console.log('🔍 [DB Health] Connecting to database...');

const sql = postgres(connectionString, { max: 1, connect_timeout: 10, idle_timeout: 5 });

async function checkDatabaseHealth() {
	try {
		const result = await sql`SELECT 1 as alive, current_database(), version()`;
		console.log('✅ [DB Health] Connection successful');
		console.log(`   Database: ${result[0].current_database}`);
		console.log(`   Version:  ${result[0].version}`);

		const tables = await sql`
			SELECT count(*)::int as count
			FROM information_schema.tables
			WHERE table_schema = 'public'
		`;
		console.log(`   Public tables: ${tables[0].count}`);

		// Check for drizzle migration journal table
		const hasMigrations = await sql`
			SELECT EXISTS (
				SELECT 1 FROM information_schema.tables
				WHERE table_schema = 'drizzle' AND table_name = '__drizzle_migrations'
			) as exists
		`;

		if (hasMigrations[0].exists) {
			const migrationCount = await sql`
				SELECT count(*)::int as count FROM drizzle.__drizzle_migrations
			`;
			console.log(`   Applied migrations: ${migrationCount[0].count}`);
		} else {
			console.log('   Applied migrations: 0 (no migration history table yet)');
		}

		await sql.end();
		console.log('✅ [DB Health] All checks passed');
		process.exit(0);
	} catch (error) {
		console.error('❌ [DB Health] Check failed:', error.message);
		await sql.end().catch(() => {});
		process.exit(1);
	}
}

checkDatabaseHealth();
