import { json } from '@sveltejs/kit';
import { sql } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		await sql`SELECT 1`;
		return json({
			status: 'ok',
			app: 'web',
			database: 'connected',
			timestamp: new Date().toISOString()
		});
	} catch (err: any) {
		return json(
			{
				status: 'error',
				app: 'web',
				database: 'disconnected',
				error: err.message,
				timestamp: new Date().toISOString()
			},
			{ status: 500 }
		);
	}
};
