import type { Database } from '../../db/client.js';
import { siteSettings } from './schema.js';

export type SiteNavLink = { label: string; href: string };
export type SiteNavColumn = { title: string; links: SiteNavLink[] };

/** Flat link, or mega-dropdown with grouped columns (Elevation-style IA). */
export type SiteNavMega = { label: string; href?: string; columns: SiteNavColumn[] };

export type SiteNavItem = SiteNavLink | SiteNavMega;

export function isMegaNavItem(item: SiteNavItem): item is SiteNavMega {
	return (
		'columns' in item &&
		Array.isArray((item as SiteNavMega).columns) &&
		(item as SiteNavMega).columns.length > 0
	);
}

export type SiteFooterColumn = { title: string; links: SiteNavLink[] };

/** Optional church-site URLs and UX toggles (giving, media, campuses, JSON-LD). */
export type SiteExtras = {
	givingUrl?: string;
	watchUrl?: string;
	/** Hero embed on /watch — YouTube embed URL or parsed from a watch link in admin. */
	watchEmbedUrl?: string;
	messagesUrl?: string;
	planVisitHref?: string;
	campuses?: { id: string; label: string; href?: string }[];
	languageOptions?: { code: string; label: string; href?: string }[];
	organizationName?: string;
	/** Canonical base URL for structured data; otherwise inferred per request. */
	siteUrl?: string;
};

export type SiteSettingsBundle = {
	/** Primary navigation — supports flat links and mega-menus. */
	navLinks: SiteNavItem[];
	footerColumns: SiteFooterColumn[];
	seoDefaults: { title: string; description: string };
	siteExtras: SiteExtras;
};

const DEFAULT_EXTRAS: SiteExtras = {
	givingUrl: '',
	planVisitHref: '/plan-a-visit',
	watchUrl: '/watch',
	watchEmbedUrl: '',
	messagesUrl: '/messages',
	campuses: [{ id: 'main', label: 'Gather with us', href: '/contact' }],
	languageOptions: [
		{ code: 'en', label: 'English', href: '#' },
		{ code: 'es', label: 'Español', href: '#' }
	],
	organizationName: 'Trailblazers Young Adults'
};

const DEFAULTS: SiteSettingsBundle = {
	navLinks: [
		{ label: 'Home', href: '/' },
		{
			label: 'Watch & listen',
			columns: [
				{
					title: 'Media',
					links: [
						{ label: 'Watch', href: '/watch' },
						{ label: 'Messages', href: '/messages' },
						{ label: 'Events', href: '/events' }
					]
				},
				{
					title: 'Connect',
					links: [
						{ label: 'Plan a visit', href: '/plan-a-visit' },
						{ label: 'Contact', href: '/contact' }
					]
				}
			]
		},
		{ label: 'Stories', href: '/stories' },
		{ label: 'Groups', href: '/groups' },
		{
			label: 'Ministries',
			columns: [
				{
					title: 'Grow & serve',
					links: [
						{ label: 'BEP Hub', href: '/bep-hub' },
						{ label: 'Serve', href: '/serve' }
					]
				},
				{
					title: 'Learn',
					links: [
						{ label: 'FAQ', href: '/faq' }
					]
				}
			]
		},
		{ label: 'Give', href: '/give' }
	],
	footerColumns: [
		{
			title: 'Ministry',
			links: [
				{ label: 'Watch', href: '/watch' },
				{ label: 'Messages', href: '/messages' },
				{ label: 'Events', href: '/events' },
				{ label: 'Plan a visit', href: '/plan-a-visit' }
			]
		},
		{
			title: 'Community',
			links: [
				{ label: 'Stories', href: '/stories' },
				{ label: 'Groups', href: '/groups' },
				{ label: 'BEP Hub', href: '/bep-hub' },
				{ label: 'Serve', href: '/serve' }
			]
		},
		{
			title: 'Connect',
			links: [
				{ label: 'FAQ', href: '/faq' },
				{ label: 'Contact', href: '/contact' },
				{ label: 'Give', href: '/give' }
			]
		}
	],
	seoDefaults: {
		title: 'Trailblazers Young Adults',
		description: 'Young adults ministry — events, community, and growth.'
	},
	siteExtras: DEFAULT_EXTRAS
};

function mergeExtras(raw: unknown): SiteExtras {
	if (!raw || typeof raw !== 'object') return { ...DEFAULT_EXTRAS };
	return { ...DEFAULT_EXTRAS, ...(raw as SiteExtras) };
}

export function createSettingsService(db: Database) {
	return {
		async getBundle(): Promise<SiteSettingsBundle> {
			const all = await db.select().from(siteSettings);
			const map = Object.fromEntries(all.map((r) => [r.key, r.value])) as Record<string, unknown>;

			const navLinks =
				(map['nav_links'] as SiteNavItem[] | undefined) ?? DEFAULTS.navLinks;
			const footerColumns =
				(map['footer_columns'] as SiteFooterColumn[] | undefined) ?? DEFAULTS.footerColumns;
			const seoDefaults =
				(map['seo_defaults'] as SiteSettingsBundle['seoDefaults'] | undefined) ??
				DEFAULTS.seoDefaults;
			const siteExtras = mergeExtras(map['site_extras']);

			return {
				navLinks,
				footerColumns,
				seoDefaults,
				siteExtras
			};
		},

		async updateSetting(key: string, value: unknown) {
			await db
				.insert(siteSettings)
				.values({ key, value })
				.onConflictDoUpdate({
					target: siteSettings.key,
					set: { value }
				});
		},

		async saveBundle(bundle: Partial<SiteSettingsBundle>) {
			if (bundle.navLinks !== undefined) {
				await this.updateSetting('nav_links', bundle.navLinks);
			}
			if (bundle.footerColumns !== undefined) {
				await this.updateSetting('footer_columns', bundle.footerColumns);
			}
			if (bundle.seoDefaults !== undefined) {
				await this.updateSetting('seo_defaults', bundle.seoDefaults);
			}
			if (bundle.siteExtras !== undefined) {
				await this.updateSetting('site_extras', bundle.siteExtras);
			}
		},

		defaults: DEFAULTS
	};
}

