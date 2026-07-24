import { services } from '$lib/server/services';
import { json, redirect, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	let email: string | undefined;
	const ct = request.headers.get('content-type') ?? '';
	if (ct.includes('application/json')) {
		const body = await request.json().catch(() => null);
		email = typeof body?.email === 'string' ? body.email : undefined;
	} else {
		const fd = await request.formData();
		email = fd.get('email')?.toString();
	}

	if (!email?.includes('@')) {
		throw error(400, 'Valid email required');
	}

	const local = email.split('@')[0] ?? 'Friend';
	await services.inquiries.createGeneral({
		name: local,
		email,
		message: 'Newsletter signup',
		type: 'NEWSLETTER'
	});

	const wantsJson = ct.includes('application/json') || request.headers.get('accept')?.includes('application/json');
	if (wantsJson) return json({ ok: true });

	return redirect(303, '/?subscribed=1');
};
