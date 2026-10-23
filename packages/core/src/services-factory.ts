import type { Database } from './db/client.js';
import { createBepService } from './modules/bep/service.js';
import { createBlogService } from './modules/blog/service.js';
import { createEventService } from './modules/events/service.js';
import { createFaqService } from './modules/faq/service.js';
import { createGroupService } from './modules/groups/service.js';
import { createIamService } from './modules/iam/service.js';
import { createInquiryService } from './modules/inquiries/service.js';
import { createLeaderService } from './modules/leaders/service.js';
import { createMediaService } from './modules/media/service.js';
import { createNewcomerService } from './modules/newcomers/service.js';
import { createPageComposerService } from './modules/pages/composer.js';
import { createParentService } from './modules/parents/service.js';
import { createServeService } from './modules/serve/service.js';
import { createSettingsService } from './modules/settings/service.js';
import { createTestimonialService } from './modules/testimonials/service.js';

import { createSermonService } from './modules/sermons/service.js';
import { createAuditLogsService } from './modules/audit-logs/service.js';
import { createTasksService } from './modules/tasks/service.js';
import { createExportService } from './modules/export/service.js';
import { createEmailService } from './modules/email/service.js';
import { createEquipmentService } from './modules/equipment/service.js';
import { createStatisticsService } from './modules/statistics/service.js';
import { createDashboardService } from './modules/statistics/dashboard.js';
import { createEventRegistrationService } from './modules/events/registration-service.js';
import { createPrayerService } from './modules/prayer/service.js';
import { createAnalyticsService } from './modules/analytics/service.js';
import { createFormGuardService } from './modules/forms/service.js';
import { createPaymentsService, type PaymentsConfig } from './modules/payments/service.js';

export type CoreServicesConfig = {
	/**
	 * Keys the HMAC that protects session and password tokens at rest.
	 * Read from SECRET_KEY by each app's `services.ts`.
	 */
	secretKey: string | undefined;
	/**
	 * Email delivery. Omit and the email service logs instead of sending, which
	 * is what local development and CI want.
	 */
	email?: {
		apiKey: string | undefined;
		from: string | undefined;
		officeAddress: string | undefined;
	};
	/**
	 * Paynow/Pesepay credentials for online giving and paid event
	 * registration. Omit and `payments.startPayment` throws a
	 * `PaymentConfigError` for every provider rather than silently doing
	 * nothing — unlike email, there is no safe "log instead of sending"
	 * fallback for money.
	 */
	payments?: PaymentsConfig;
};

export function createCoreServices(db: Database, config: CoreServicesConfig) {
	// Built ahead of the returned object so `payments` can be given its
	// `confirmPaidRegistration` callback below — a manual "mark as paid"
	// override on an event-registration payment must flip the hold the
	// same way the provider callback does (see registration-service.ts).
	const eventRegistrationsService = createEventRegistrationService(db);

	return {
		iam: createIamService(db, { secretKey: config.secretKey }),
		events: createEventService(db),
		sermons: createSermonService(db),
		blog: createBlogService(db),
		groups: createGroupService(db),
		testimonials: createTestimonialService(db),
		leaders: createLeaderService(db),
		media: createMediaService(db),
		faq: createFaqService(db),
		inquiries: createInquiryService(db, { secretKey: config.secretKey }),
		bep: createBepService(db),
		equipment: createEquipmentService(db),
		settings: createSettingsService(db),
		pages: createPageComposerService(db),
		serve: createServeService(db),
		newcomers: createNewcomerService(db),
		parents: createParentService(db),
		auditLogs: createAuditLogsService(db),
		tasks: createTasksService(db),
		export: createExportService(),
		email: createEmailService(
			config.email ?? { apiKey: undefined, from: undefined, officeAddress: undefined }
		),
		eventRegistrations: eventRegistrationsService,
		prayer: createPrayerService(db),
		statistics: createStatisticsService(db),
		dashboard: createDashboardService(db),
		analytics: createAnalyticsService(db, { secretKey: config.secretKey }),
		formGuard: createFormGuardService(db, { secretKey: config.secretKey }),
		payments: createPaymentsService(
			db,
			config.payments ?? {
				paynow: { integrationId: undefined, integrationKey: undefined },
				pesepay: { integrationKey: undefined, encryptionKey: undefined },
				defaultProvider: 'PAYNOW'
			},
			undefined,
			async (registrationId) => {
				await eventRegistrationsService.confirmPaidRegistration(registrationId);
			}
		)
	};
}

export type CoreServices = ReturnType<typeof createCoreServices>;
