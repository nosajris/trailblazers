/**
 * Ranking for the site search overlay.
 *
 * The overlay used to offer a fixed list of links, so anyone looking for a
 * named group, event or message had to guess which page it lived on. This
 * scores real records against what was typed. It is pure and framework-free:
 * the server fetches the records, this decides what comes back and in what
 * order, and both sides are unit tested.
 */

export type SearchKind = 'page' | 'event' | 'group' | 'sermon';

export type SearchItem = {
	/** Unique within a result set, so lists can be keyed. */
	id: string;
	kind: SearchKind;
	title: string;
	subtitle?: string;
	href: string;
	/** Extra words to match on that are not shown, such as a leader's name. */
	keywords?: string;
};

/** Upcoming things first when scores tie; pages last, since they are always reachable. */
const KIND_WEIGHT: Record<SearchKind, number> = { event: 3, group: 2, sermon: 1, page: 0 };

const fold = (value: string): string =>
	value
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '');

export function searchTerms(query: string): string[] {
	return fold(query)
		.split(/[^a-z0-9]+/)
		.filter((term) => term.length > 0);
}

/**
 * How well one item matches one term. 0 means no match, so the caller can
 * require every term to hit something.
 */
function scoreTerm(item: SearchItem, term: string): number {
	const title = fold(item.title);
	if (title === term) return 100;
	if (title.startsWith(term)) return 60;
	if (new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(title)) return 40;
	if (title.includes(term)) return 25;

	const rest = fold(`${item.subtitle ?? ''} ${item.keywords ?? ''}`);
	if (new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(rest)) return 12;
	if (rest.includes(term)) return 6;
	return 0;
}

/**
 * The best `limit` matches for `query`, highest score first.
 *
 * Every term must match somewhere, so typing more words narrows rather than
 * widens. An empty query returns nothing: the overlay shows its own shortcuts
 * instead of a meaningless "everything" list.
 */
export function searchItems<T extends SearchItem>(items: readonly T[], query: string, limit = 8): T[] {
	const terms = searchTerms(query);
	if (terms.length === 0) return [];

	const scored: { item: T; score: number }[] = [];

	for (const item of items) {
		let total = 0;
		let matchedEvery = true;

		for (const term of terms) {
			const score = scoreTerm(item, term);
			if (score === 0) {
				matchedEvery = false;
				break;
			}
			total += score;
		}

		if (matchedEvery) scored.push({ item, score: total + KIND_WEIGHT[item.kind] });
	}

	return scored
		.sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
		.slice(0, limit)
		.map((entry) => entry.item);
}
