export type FilterableGroup = {
	name: string;
	leader: string;
	dayTime: string;
	type: string;
	description?: string | null;
};

export const GROUP_TYPE_LABELS: Record<string, string> = {
	CAMPUS: 'Campus',
	PRO: 'Professionals',
	INTEREST: 'Interest',
	ONLINE: 'Online'
};

/** Types actually present, in a stable order, so empty filters are never offered. */
export function groupTypesPresent(groups: readonly FilterableGroup[]): string[] {
	const present = new Set(groups.map((g) => g.type));
	const known = Object.keys(GROUP_TYPE_LABELS).filter((t) => present.has(t));
	const other = [...present].filter((t) => !(t in GROUP_TYPE_LABELS)).sort();
	return [...known, ...other];
}

/** Filters by type ('ALL' or empty = any) and a case-insensitive search over name, leader, time and description. */
export function filterGroups<T extends FilterableGroup>(groups: readonly T[], type: string, query: string): T[] {
	const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
	return groups.filter((g) => {
		if (type && type !== 'ALL' && g.type !== type) return false;
		const hay = `${g.name} ${g.leader} ${g.dayTime} ${g.description ?? ''}`.toLowerCase();
		return terms.every((t) => hay.includes(t));
	});
}
