import type { Database } from './db/client.js';
import { createBepService } from './modules/bep/service.js';
import { createBlogService } from './modules/blog/service.js';
import { createEventService } from './modules/events/service.js';
import { createFaqService } from './modules/faq/service.js';
import { createGroupService } from './modules/groups/service.js';
import { createIamService } from './modules/iam/service.js';
import { createInquiryService } from './modules/inquiries/service.js';
import { createLeaderService } from './modules/leaders/service.js';
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

export function createCoreServices(db: Database) {
	return {
		iam: createIamService(db),
		events: createEventService(db),
		sermons: createSermonService(db),
		blog: createBlogService(db),
		groups: createGroupService(db),
		testimonials: createTestimonialService(db),
		leaders: createLeaderService(db),
		faq: createFaqService(db),
		inquiries: createInquiryService(db),
		bep: createBepService(db),
		settings: createSettingsService(db),
		pages: createPageComposerService(db),
		serve: createServeService(db),
		newcomers: createNewcomerService(db),
		parents: createParentService(db),
		auditLogs: createAuditLogsService(db),
		tasks: createTasksService(db),
		export: createExportService(),
		email: createEmailService()
	};
}




export type CoreServices = ReturnType<typeof createCoreServices>;
