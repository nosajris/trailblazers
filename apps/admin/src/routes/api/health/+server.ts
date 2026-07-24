import { json } from '@sveltejs/kit';
import { sql } from '$lib/server/db.js';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		await sql`SELECT 1`;
		return json({
			status: 'ok',
			app: 'admin',
			database: 'connected',
			timestamp: new Date().toISOString()
		});
	} catch (err: any) {
		return json(
			{
				status: 'error',
				app: 'admin',
				database: 'disconnected',
				error: err.message,
				timestamp: new Date().toISOString()
			},
			{ status: 500 }
		);
	}
};
