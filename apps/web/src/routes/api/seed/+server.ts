import { seed } from '$lib/server/db/seed';
import { json } from '@sveltejs/kit';

export async function GET() {
    try {
        await seed();
        return json({ success: true, message: 'Database seeded successfully!' });
    } catch (error) {
        console.error(error);
        return json({ success: false, error: 'Failed to seed database' }, { status: 500 });
    }
}