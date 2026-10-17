/**
 * Pure logic for cookieless page-view analytics — no visitor identity is ever
 * stored, only a one-way daily mark and running counts. Kept free of the
 * database so every rule here is directly unit-testable.
 *
 * Adapted from Strata's `src/stats.js`, trimmed for one single-tenant site
 * (no per-site HMAC secret, no `slug`).
 */
import crypto from 'node:crypto';

/** Today as YYYY-MM-DD in the site's own timezone (Africa/Harare, UTC+2 all year, no DST). */
export function dayOf(ms = Date.now()): string {
	return new Date(ms + 2 * 3600_000).toISOString().slice(0, 10);
}

const SOURCES: ReadonlyArray<readonly [RegExp, string]> = [
	[/instagram/i, 'Instagram'],
	[/facebook|fb\.com|fb\.me|messenger/i, 'Facebook'],
	[/whatsapp|wa\.me/i, 'WhatsApp'],
	[/tiktok/i, 'TikTok'],
	[/(^|\.)t\.co$|twitter|(^|\.)x\.com$/i, 'X'],
	[/linkedin|lnkd\.in/i, 'LinkedIn'],
	[/youtube|youtu\.be/i, 'YouTube'],
	[/(^|\.)t\.me$|telegram/i, 'Telegram'],
	[/google|bing\.|duckduckgo|yahoo|ecosia/i, 'Search']
];

const ALIAS: Record<string, string> = {
	ig: 'Instagram',
	instagram: 'Instagram',
	fb: 'Facebook',
	facebook: 'Facebook',
	wa: 'WhatsApp',
	whatsapp: 'WhatsApp',
	tt: 'TikTok',
	tiktok: 'TikTok',
	x: 'X',
	tw: 'X',
	twitter: 'X',
	yt: 'YouTube',
	youtube: 'YouTube',
	li: 'LinkedIn',
	linkedin: 'LinkedIn',
	tg: 'Telegram',
	telegram: 'Telegram',
	google: 'Search',
	bing: 'Search',
	email: 'Email',
	sms: 'SMS'
};

function part(value: unknown): string {
	return String(value ?? '')
		.toLowerCase()
		.replace(/[^a-z0-9_.-]/g, '')
		.slice(0, 32);
}

export type Utm = { source: string; medium: string; content: string; campaign: string };

/** The four utm_ query words (?utm_source=ig&utm_medium=social&utm_content=...&utm_campaign=...), cleaned. */
export function utmOf(query: {
	utm_source?: string | null;
	utm_medium?: string | null;
	utm_content?: string | null;
	utm_campaign?: string | null;
}): Utm {
	return {
		source: part(query.utm_source),
		medium: part(query.utm_medium),
		content: part(query.utm_content),
		campaign: part(query.utm_campaign)
	};
}

export function hasUtm(u: Utm): boolean {
	return Boolean(u.source || u.medium || u.content || u.campaign);
}

export type SourceInput = { src?: string; ref?: string; ua?: string; utm?: Utm | null };

/** Where a visit came from: a `?src=` tag the owner set, else the referring page, else the app it opened in. */
export function sourceOf({ src = '', ref = '', ua = '', utm = null }: SourceInput): string {
	if (utm?.source) return ALIAS[utm.source] ?? `tag:${utm.source}`;
	const tag = String(src)
		.toLowerCase()
		.replace(/[^a-z0-9_-]/g, '')
		.slice(0, 24);
	if (tag) return `tag:${tag}`;
	const host = String(ref)
		.toLowerCase()
		.replace(/[^a-z0-9.-]/g, '')
		.slice(0, 80);
	for (const [re, name] of SOURCES) {
		if (host && re.test(host)) return name;
	}
	if (/Instagram/i.test(ua)) return 'Instagram';
	if (/FBAN|FBAV|FB_IAB/i.test(ua)) return 'Facebook';
	if (/WhatsApp/i.test(ua)) return 'WhatsApp';
	if (/musical_ly|TikTok|BytedanceWebview/i.test(ua)) return 'TikTok';
	return host ? 'Other websites' : 'Direct';
}

/** Likely a program, not a person — bots are counted in no total. */
export function looksLikeBot(ua: string | null | undefined): boolean {
	return (
		!ua ||
		/bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp\/|curl|wget|python|headless|lighthouse|monitor|uptime/i.test(
			ua
		)
	);
}

/**
 * The one-way daily mark for a visitor: an HMAC of the day, IP and user
 * agent together, so it cannot be linked to the same visitor on a different
 * day, and the IP/UA themselves are never stored.
 */
export function markFor(secretKey: string, day: string, ip: string, ua: string): string {
	return crypto
		.createHmac('sha256', secretKey)
		.update(`stat:${day}:${ip}:${ua}`)
		.digest('hex')
		.slice(0, 20);
}

export type StatRow = { day: string; metric: string; key: string; label: string; n: number };

export type DayPoint = { day: string; views: number; visitors: number; clicks: number };

export type AnalyticsReport = {
	days: number;
	series: DayPoint[];
	views: number;
	visitors: number;
	clicks: number;
	/** Of the visitors who came, the percent who clicked something — 0 to 100. */
	rate: number;
	links: Array<{ href: string; label: string; n: number }>;
	campaigns: Array<{ source: string; medium: string; content: string; campaign: string; n: number }>;
	sources: Array<{ name: string; tag: boolean; n: number }>;
};

/** Builds the report shape out of raw rows for the last `days` days (today included, every day present so a chart has no gaps). */
export function buildReport(rows: StatRow[], days: number, now = Date.now()): AnalyticsReport {
	const series: DayPoint[] = Array.from({ length: days }, (_, i) => ({
		day: dayOf(now - (days - 1 - i) * 86_400_000),
		views: 0,
		visitors: 0,
		clicks: 0
	}));
	const at = new Map(series.map((d) => [d.day, d]));
	const links = new Map<string, { href: string; label: string; n: number }>();
	const sources = new Map<string, number>();
	const campaigns = new Map<string, number>();

	for (const row of rows) {
		const d = at.get(row.day);
		if (!d) continue;
		if (row.metric === 'view') d.views += row.n;
		else if (row.metric === 'visitor') d.visitors += row.n;
		else if (row.metric === 'click') {
			d.clicks += row.n;
			const link = links.get(row.key) ?? { href: row.key, label: row.label, n: 0 };
			link.n += row.n;
			if (row.label) link.label = row.label;
			links.set(row.key, link);
		} else if (row.metric === 'source') {
			sources.set(row.key, (sources.get(row.key) ?? 0) + row.n);
		} else if (row.metric === 'campaign') {
			campaigns.set(row.key, (campaigns.get(row.key) ?? 0) + row.n);
		}
	}

	const sum = (key: 'views' | 'visitors' | 'clicks') => series.reduce((total, d) => total + d[key], 0);
	const visitors = sum('visitors');
	const clicks = sum('clicks');

	return {
		days,
		series,
		views: sum('views'),
		visitors,
		clicks,
		rate: visitors ? Math.min(100, Math.round((clicks / visitors) * 100)) : 0,
		links: [...links.values()].sort((a, b) => b.n - a.n).slice(0, 12),
		campaigns: [...campaigns]
			.map(([key, n]) => {
				const [source, medium, content, campaign] = key.split('|');
				return { source, medium, content, campaign, n };
			})
			.sort((a, b) => b.n - a.n)
			.slice(0, 12),
		sources: [...sources]
			.map(([name, n]) => ({ name: name.startsWith('tag:') ? name.slice(4) : name, tag: name.startsWith('tag:'), n }))
			.sort((a, b) => b.n - a.n)
			.slice(0, 8)
	};
}
