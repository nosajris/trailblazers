import { db } from '$lib/server/db';
import { sql } from 'drizzle-orm';
import { json } from '@sveltejs/kit';

export async function GET() {
    try {
        console.log('Resetting database...');
        // Drop the tables causing conflicts
        await db.execute(sql`DROP TABLE IF EXISTS "events" CASCADE`);
        await db.execute(sql`DROP TABLE IF EXISTS "groups" CASCADE`);
        
        // Drop the custom types to ensure a clean slate
        await db.execute(sql`DROP TYPE IF EXISTS "event_type" CASCADE`);
        await db.execute(sql`DROP TYPE IF EXISTS "group_type" CASCADE`);
        
        return json({ success: true, message: 'Tables dropped successfully. You can now run db:push.' });
    } catch (error) {
        console.error(error);
        return json({ success: false, error: String(error) }, { status: 500 });
    }
}