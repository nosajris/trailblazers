import { createCoreServices } from '@trailblazers/core';
import { db } from './db';

export const services = createCoreServices(db, {
	// Keys the HMAC protecting session and password tokens at rest.
	secretKey: process.env.SECRET_KEY,
	// Without RESEND_API_KEY the email service logs instead of sending, so
	// local development and CI work unchanged.
	email: {
		apiKey: process.env.RESEND_API_KEY,
		from: process.env.EMAIL_FROM,
		officeAddress: process.env.OFFICE_EMAIL
	}
});
