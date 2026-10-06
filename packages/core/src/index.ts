export { createDatabase, type Database, type AppSchema } from './db/client.js';
export * from './db/schema.js';
export { createCoreServices, type CoreServices } from './services-factory.js';

export { createIamService } from './modules/iam/service.js';
export { createEventService } from './modules/events/service.js';
export { createSermonService } from './modules/sermons/service.js';

export type { EventCardVm, EventListingResult, EventListingFilters } from './modules/events/types.js';
export type { BlogPostVm } from './modules/blog/types.js';
export { createBlogService } from './modules/blog/service.js';
export { createGroupService } from './modules/groups/service.js';
export { parseWhatsappLink } from './modules/groups/whatsapp.js';
export { createTestimonialService } from './modules/testimonials/service.js';
export { createLeaderService } from './modules/leaders/service.js';
export { createFaqService } from './modules/faq/service.js';
export { createInquiryService } from './modules/inquiries/service.js';
export { createBepService } from './modules/bep/service.js';
export { createSettingsService } from './modules/settings/service.js';
export {
	visitDetailsSchema,
	MAX_VISIT_TIMES,
	type VisitDetails
} from './modules/settings/validation.js';
export { createPageComposerService } from './modules/pages/composer.js';
export { createServeService } from './modules/serve/service.js';
export { createNewcomerService } from './modules/newcomers/service.js';
export { createParentService } from './modules/parents/service.js';
export { createAuditLogsService } from './modules/audit-logs/service.js';
export { createTasksService } from './modules/tasks/service.js';
export { createExportService, escapeCsvValue, toCsvCell } from './modules/export/service.js';
export {
	formDataToObject,
	parseForm,
	summarizeErrors,
	toFieldErrors,
	checkbox,
	date,
	email,
	id,
	oneOf,
	optionalId,
	optionalPhone,
	optionalText,
	optionalUrl,
	requiredText,
	type FieldErrors,
	type ParseResult
} from './util/form.js';
export {
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	paginate,
	readPageRequest,
	type PageRequest,
	type Paginated
} from './util/pagination.js';
export { createEventRepository, type EventRepository } from './modules/events/repository.js';
export {
	saveEventSchema,
	deleteEventSchema,
	EVENT_TYPES,
	EVENT_STATUSES,
	type SaveEventInput,
	type DeleteEventInput
} from './modules/events/validation.js';
export { NEWSLETTER_CONSENT_TEXT } from './modules/inquiries/service.js';
export {
	registerForEventSchema,
	joinGroupSchema,
	type RegisterForEventInput,
	type JoinGroupInput
} from './modules/events/registration-validation.js';
export {
	isFull,
	isRegistrationOpen,
	nextInLine,
	nextRegistrationStatus,
	seatsRemaining,
	type CapacityState,
	type RegistrationStatus
} from './modules/events/registration.js';
export { createEventRegistrationService } from './modules/events/registration-service.js';
export { createDashboardService, type DashboardCounts } from './modules/statistics/dashboard.js';
export { createEmailService } from './modules/email/service.js';
export { logger, registerDbSink } from './logger.js';
export { Sanitizer } from './util/sanitizer.js';
export { createRateLimiter } from './util/rate-limiter.js';
export type { RateLimiter, RateLimitResult, RateLimiterOptions } from './util/rate-limiter.js';
export {
	buildSecurityHeaders,
	shouldSendHsts,
	type SecurityHeaderOptions
} from './util/security-headers.js';
export {
	assertUsableSecret,
	createSessionToken,
	hashSessionToken,
	hashesMatch,
	decideRefresh,
	IDLE_TTL_MS,
	ABSOLUTE_TTL_MS,
	type SessionTokenPair,
	type SessionWindow,
	type RefreshDecision
} from './modules/iam/session-tokens.js';
export {
	ADMIN_PORTAL_ROLES,
	PolicyError,
	canAccessAdmin,
	canAccessPath,
	canAccessSection,
	canManageUsers,
	checkUserMutation,
	sectionForPath
} from './modules/iam/permissions.js';
export type {
	Actor,
	AdminSection,
	PolicyDecision,
	UserMutation
} from './modules/iam/permissions.js';



export type {
	HomeSectionBlock,
	HomeHeroVm,
	HomeEventsRailVm,
	HomeBlogVm,
	HomeTestimonialsVm,
	HomeGroupsVm,
	HomeLeadersVm,
	HomeFaqVm,
	HomeContactVm,
	HomeCustomVm
} from './modules/pages/view-models.js';
export type {
	SiteNavLink,
	SiteNavItem,
	SiteNavMega,
	SiteNavColumn,
	SiteFooterColumn,
	SiteExtras,
	SiteSettingsBundle
} from './modules/settings/service.js';
export { isMegaNavItem } from './modules/settings/service.js';
export type { RichSectionVm } from './modules/serve/types.js';
export type { PublicUserVm, UserRole } from './modules/iam/types.js';

export { createPrayerService, submitPrayerSchema, updatePrayerSchema } from './modules/prayer/service.js';
export type { SubmitPrayerInput, UpdatePrayerInput } from './modules/prayer/service.js';
export {
	canShowPublicly,
	canStaffShare,
	toPublicPrayer,
	toPublicPrayerList,
	type PublicPrayerVm
} from './modules/prayer/visibility.js';

export {
	DEFAULT_LOCALE,
	SUPPORTED_LOCALES,
	LOCALE_NAMES,
	createTranslator,
	isSupportedLocale,
	localeFromAcceptLanguage,
	resolveLocale,
	translationCoverage,
	type Locale,
	type Messages
} from './util/i18n.js';
export { catalogues, en } from './i18n/index.js';
export {
	ALLOWED_IMAGE_TYPES,
	MAX_UPLOAD_BYTES,
	buildStorageKey,
	validateUpload,
	type StorageAdapter,
	type StoredFile,
	type ValidationResult
} from './util/storage.js';
