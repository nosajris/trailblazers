/**
 * The site's icon set: one curated, searchable collection used by the staff
 * editor's block glyphs and by any block field that lets staff pick an icon.
 *
 * Why a hand-kept set rather than an icon package. These are 24×24 stroke
 * glyphs of a few hundred bytes each, and the whole set is smaller than the
 * manifest of a packaged library. The audience is on Zimbabwean mobile data and
 * `packages/ui/src/page-weight.test.ts` holds the line on bytes, so pulling in
 * a thousand icons to ship thirty is the wrong trade. It also means every glyph
 * shares one geometry and stroke weight instead of a package's house style
 * fighting the Zinc theme.
 *
 * `keywords` is what the picker searches, so an icon is findable by what staff
 * would call it rather than only by its name ("phone" finds `call`).
 *
 * Every icon renders inside `Icon.svelte`, which supplies the 24×24 viewBox and
 * `stroke="currentColor"` — so a path here draws strokes only and sets no fill
 * or colour of its own.
 */

export type IconDefinition = {
	/** One or more `d` attributes, drawn in order. */
	paths: string[];
	/** Extra words the picker matches, beyond the icon's own name. */
	keywords: string[];
};

export const ICONS: Record<string, IconDefinition> = {
	layout: {
		paths: ['M3 5h18M3 12h12M3 19h18'],
		keywords: ['hero', 'banner', 'headline', 'lines', 'text']
	},
	calendar: {
		paths: ['M4 5h16v16H4zM4 9h16M8 3v4M16 3v4M8 14h2M14 14h2'],
		keywords: ['event', 'date', 'diary', 'schedule', 'month']
	},
	clock: {
		paths: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2'],
		keywords: ['time', 'service times', 'hours', 'when', 'duration']
	},
	book: {
		paths: ['M4 4h8a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H4zM20 4h-8a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h9z'],
		keywords: ['story', 'stories', 'blog', 'bible', 'read', 'scripture', 'news']
	},
	quote: {
		paths: [
			'M7 7a4 4 0 0 0-4 4v2a2 2 0 0 0 2 2h2v4H5v2h4v-8H5a2 2 0 0 1 2-4zM17 7a4 4 0 0 0-4 4v2a2 2 0 0 0 2 2h2v4h-2v2h4v-8h-2a2 2 0 0 1 2-4z'
		],
		keywords: ['testimonial', 'quotation', 'saying', 'words', 'review']
	},
	users: {
		paths: [
			'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20a6 6 0 0 1 12 0M17 11a3 3 0 1 0 0-6M21 20a6 6 0 0 0-5.5-6'
		],
		keywords: ['group', 'people', 'community', 'team', 'members', 'cell']
	},
	'user-plus': {
		paths: ['M11 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM3 21a8 8 0 0 1 14-5M18 14v6M15 17h6'],
		keywords: ['join', 'newcomer', 'sign up', 'register', 'invite', 'add']
	},
	badge: {
		paths: ['M12 2l3 3h4v4l3 3-3 3v4h-4l-3 3-3-3H5v-4l-3-3 3-3V5h4z', 'M9.5 12l1.8 1.8L15 10'],
		keywords: ['leader', 'pastor', 'verified', 'approved', 'trust', 'seal']
	},
	heart: {
		paths: ['M12 20s-7-4.5-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9z'],
		keywords: ['love', 'care', 'welcome', 'new', 'serve', 'giving', 'kindness']
	},
	hand: {
		paths: [
			'M8 13V6a2 2 0 1 1 4 0v5M12 11V4.5a2 2 0 1 1 4 0V11M16 11V7a2 2 0 1 1 4 0v8a6 6 0 0 1-6 6h-1a7 7 0 0 1-7-7v-2l-1.6-1.6a2 2 0 0 1 2.8-2.8L8 13'
		],
		keywords: ['serve', 'volunteer', 'help', 'offer', 'raise', 'welcome']
	},
	baby: {
		paths: [
			'M12 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM5 21a7 7 0 0 1 14 0M9 13.5c.6.6 1.4 1 3 1s2.4-.4 3-1'
		],
		keywords: ['child', 'children', 'kids', 'parents', 'family', 'creche']
	},
	help: {
		paths: [
			'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9a2.5 2.5 0 1 1 4 2c-.6.5-1.5 1-1.5 2.5M12 17h.01'
		],
		keywords: ['faq', 'question', 'ask', 'unsure', 'support']
	},
	mail: {
		paths: ['M4 5h16v14H4zM4 6l8 7 8-7'],
		keywords: ['email', 'contact', 'write', 'message', 'newsletter', 'inbox']
	},
	call: {
		paths: [
			'M5 3h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 12l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z'
		],
		keywords: ['phone', 'telephone', 'ring', 'contact', 'mobile', 'whatsapp']
	},
	message: {
		paths: ['M4 4h16v11H9l-5 4z'],
		keywords: ['chat', 'whatsapp', 'talk', 'comment', 'prayer', 'reply']
	},
	'map-pin': {
		paths: [
			'M12 22s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12zM12 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z'
		],
		keywords: ['place', 'address', 'campus', 'location', 'directions', 'where', 'map']
	},
	home: {
		paths: ['M3 11l9-8 9 8M6 10v11h12V10'],
		keywords: ['house', 'campus', 'building', 'visit', 'address']
	},
	cross: {
		paths: ['M10 3h4v6h6v4h-6v8h-4v-8H4V9h6z'],
		keywords: ['faith', 'church', 'christ', 'gospel', 'worship', 'salvation']
	},
	music: {
		paths: ['M9 18V6l11-2v12M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3zM20 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3z'],
		keywords: ['worship', 'song', 'praise', 'choir', 'band', 'sing']
	},
	mic: {
		paths: [
			'M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zM6 11v1a6 6 0 0 0 12 0v-1M12 18v3M9 21h6'
		],
		keywords: ['sermon', 'preach', 'message', 'speak', 'podcast', 'teaching']
	},
	play: {
		paths: ['M7 4l12 8-12 8z'],
		keywords: ['watch', 'video', 'stream', 'live', 'sermon', 'start']
	},
	video: {
		paths: ['M3 6h12v12H3zM15 10l6-3v10l-6-3z'],
		keywords: ['watch', 'stream', 'live', 'camera', 'recording', 'youtube']
	},
	camera: {
		paths: ['M3 8h4l2-3h6l2 3h4v13H3zM12 18a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
		keywords: ['photo', 'picture', 'gallery', 'album', 'snapshot']
	},
	image: {
		paths: ['M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15 9.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z'],
		keywords: ['photo', 'picture', 'gallery', 'media', 'banner']
	},
	gift: {
		paths: [
			'M3 11h18v10H3zM3 7h18v4H3zM12 7v14',
			'M12 7S10 3 7.5 4.5 9 7 12 7zM12 7s2-4 4.5-2.5S15 7 12 7z'
		],
		keywords: ['give', 'giving', 'offering', 'tithe', 'donate', 'present']
	},
	send: {
		paths: ['M22 2 11 13M22 2l-7 20-4-9-9-4z'],
		keywords: ['submit', 'share', 'go', 'post', 'reply', 'form']
	},
	star: {
		paths: ['M12 3l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 18l-5.9 3 1.2-6.5L2.5 9.9 9.1 9z'],
		keywords: ['favourite', 'featured', 'highlight', 'special', 'rating']
	},
	check: {
		paths: ['M20 6 9 17l-5-5'],
		keywords: ['done', 'yes', 'tick', 'confirmed', 'complete', 'approved']
	},
	bell: {
		paths: ['M18 16V11a6 6 0 1 0-12 0v5l-2 3h16zM10 22a2 2 0 0 0 4 0'],
		keywords: ['reminder', 'notify', 'alert', 'announcement', 'news']
	},
	download: {
		paths: ['M12 3v12M7 11l5 5 5-5M4 21h16'],
		keywords: ['save', 'file', 'notes', 'pdf', 'get', 'guide']
	},
	'file-text': {
		paths: ['M14 3H6v18h12V7zM14 3v4h4M9 12h6M9 16h6'],
		keywords: ['notes', 'document', 'guide', 'form', 'page', 'article']
	},
	link: {
		paths: [
			'M9 15l6-6',
			'M10.5 6.5l1.8-1.8a4 4 0 0 1 5.7 5.7l-1.8 1.8M13.5 17.5l-1.8 1.8a4 4 0 0 1-5.7-5.7l1.8-1.8'
		],
		keywords: ['url', 'website', 'external', 'connect', 'chain']
	},
	globe: {
		paths: [
			'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3a14 14 0 0 1 0 18A14 14 0 0 1 12 3z'
		],
		keywords: ['online', 'website', 'world', 'language', 'mission', 'internet']
	},
	search: {
		paths: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.5-4.5'],
		keywords: ['find', 'look', 'filter', 'magnify', 'explore']
	},
	shield: {
		paths: ['M12 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z'],
		keywords: ['safe', 'safeguarding', 'privacy', 'secure', 'protect', 'trust']
	},
	lock: {
		paths: ['M5 11h14v10H5zM8 11V8a4 4 0 1 1 8 0v3M12 15v3'],
		keywords: ['private', 'confidential', 'secure', 'password', 'closed']
	},
	sun: {
		paths: [
			'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z',
			'M12 2v2M12 20v2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4'
		],
		keywords: ['morning', 'day', 'bright', 'summer', 'camp', 'outdoor']
	},
	sparkle: {
		paths: [
			'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
			'M19 16l.9 2.1L22 19l-2.1.9L19 22l-.9-2.1L16 19l2.1-.9z'
		],
		keywords: ['new', 'special', 'highlight', 'fresh', 'celebrate']
	},
	flame: {
		paths: [
			'M12 22a6 6 0 0 0 6-6c0-5-6-10-6-10S6 11 6 16a6 6 0 0 0 6 6z',
			'M12 18a2 2 0 0 0 2-2c0-1.5-2-3.5-2-3.5s-2 2-2 3.5a2 2 0 0 0 2 2z'
		],
		keywords: ['spirit', 'passion', 'revival', 'fire', 'camp', 'youth']
	},
	leaf: {
		paths: ['M4 20c0-8 6-14 16-15 0 10-6 15-13 15H4M4 20c3-5 7-8 12-9'],
		keywords: ['grow', 'growth', 'discipleship', 'nature', 'new life', 'plant']
	},
	coffee: {
		paths: ['M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 9h2a3 3 0 0 1 0 6h-2M4 22h13'],
		keywords: ['welcome', 'hospitality', 'meet', 'fellowship', 'tea', 'cafe']
	},
	list: {
		paths: ['M8 6h13M8 12h13M8 18h13M4 6h.01M4 12h.01M4 18h.01'],
		keywords: ['steps', 'items', 'agenda', 'order', 'bullets', 'rota']
	},
	grid: {
		paths: ['M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'],
		keywords: ['cards', 'tiles', 'sections', 'gallery', 'layout', 'menu']
	}
};

export type IconName = keyof typeof ICONS;

export const ICON_NAMES = Object.keys(ICONS).sort();

export function hasIcon(name: string): boolean {
	return Object.prototype.hasOwnProperty.call(ICONS, name);
}

/**
 * The picker's search: matches the icon's own name first, then its keywords, so
 * typing "phone" finds `call` and typing "cal" still puts `calendar` on top.
 *
 * A blank query returns everything, which is what an unopened picker shows.
 */
export function searchIcons(query: string, names: string[] = ICON_NAMES): string[] {
	const needle = query.trim().toLowerCase();
	if (needle === '') return names;

	const scored: { name: string; score: number }[] = [];

	for (const name of names) {
		const icon = ICONS[name];
		if (!icon) continue;

		let score = 0;
		if (name === needle) score = 5;
		else if (name.startsWith(needle)) score = 4;
		else if (name.includes(needle)) score = 3;
		else if (icon.keywords.some((word) => word.startsWith(needle))) score = 2;
		else if (icon.keywords.some((word) => word.includes(needle))) score = 1;

		if (score > 0) scored.push({ name, score });
	}

	return scored
		.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
		.map((entry) => entry.name);
}
