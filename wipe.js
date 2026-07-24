import { neon } from '@neondatabase/serverless';
import 'dotenv/config'; // Make sure you have dotenv installed or set env var manually

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log('Wiping database...');
  await sql`DROP SCHEMA public CASCADE`;
  await sql`CREATE SCHEMA public`;
  console.log('Database wiped. You can now run db:push');
}

main();