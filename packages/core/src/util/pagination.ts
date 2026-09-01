/**
 * Pagination for admin lists.
 *
 * No admin list was paginated: `getAllEventsForAdmin`, `getAllUsersForAdmin`,
 * `getAllSermons` and the rest returned every row. That is survivable at
 * seed-data volumes and becomes a problem exactly when the church grows.
 *
 * Kept free of imports so it stays pure and directly testable.
 */

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

export type PageRequest = { page: number; pageSize: number; offset: number };

export type Paginated<T> = {
	items: T[];
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
	hasPrevious: boolean;
	hasNext: boolean;
};

/**
 * Reads page settings from a query string, clamping them.
 *
 * Anything unparseable becomes the default rather than an error: a bad `?page`
 * in a shared link should show page one, not a 500. The size cap matters —
 * without it `?pageSize=1000000` is a free denial-of-service.
 */
export function readPageRequest(
	params: URLSearchParams | { get(key: string): string | null },
	defaultPageSize: number = DEFAULT_PAGE_SIZE
): PageRequest {
	const rawPage = Number(params.get('page'));
	const rawSize = Number(params.get('pageSize'));

	const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;

	const pageSize =
		Number.isFinite(rawSize) && rawSize >= 1
			? Math.min(Math.floor(rawSize), MAX_PAGE_SIZE)
			: defaultPageSize;

	return { page, pageSize, offset: (page - 1) * pageSize };
}

/** Wraps a page of rows with the numbers a pager needs. */
export function paginate<T>(items: T[], total: number, request: PageRequest): Paginated<T> {
	const totalPages = total === 0 ? 0 : Math.ceil(total / request.pageSize);

	return {
		items,
		page: request.page,
		pageSize: request.pageSize,
		total,
		totalPages,
		hasPrevious: request.page > 1,
		hasNext: request.page < totalPages
	};
}
