import { json } from '@sveltejs/kit';
import { logger } from '@trailblazers/core';
import { sql } from '$lib/server/db';
import type { RequestHandler } from './$types';

/**
 * Unauthenticated liveness probe. It reports up/down and nothing else — the
 * driver's error text carries the database host, name and role, and this
 * endpoint is reachable by anyone.
 */
export const GET: RequestHandler = async () => {
	try {
		await sql`SELECT 1`;
		return json({
			status: 'ok',
			app: 'web',
			database: 'connected',
			timestamp: new Date().toISOString()
		});
	} catch (err) {
		logger.error('HealthCheck', 'web database probe failed', {
			message: err instanceof Error ? err.message : String(err)
		});
		return json(
			{
				status: 'error',
				app: 'web',
				database: 'disconnected',
				timestamp: new Date().toISOString()
			},
			{ status: 503 }
		);
	}
};
