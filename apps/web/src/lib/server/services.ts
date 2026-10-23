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
	},
	// Without these, services.payments.startPayment throws a clear
	// PaymentConfigError for every provider rather than silently doing
	// nothing — there is no safe "log instead of sending" fallback for money.
	payments: {
		paynow: {
			integrationId: process.env.PAYNOW_INTEGRATION_ID,
			integrationKey: process.env.PAYNOW_INTEGRATION_KEY
		},
		pesepay: {
			integrationKey: process.env.PESEPAY_INTEGRATION_KEY,
			encryptionKey: process.env.PESEPAY_ENCRYPTION_KEY
		},
		defaultProvider: process.env.PAYMENTS_PROVIDER === 'PESEPAY' ? 'PESEPAY' : 'PAYNOW'
	}
});
