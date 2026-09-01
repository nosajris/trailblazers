import { and } from 'drizzle-orm';
import type { Database } from '../../db/client.js';
import { toEventCard } from './mappers.js';
import { createEventRepository, type EventRow } from './repository.js';
import { paginate, type PageRequest, type Paginated } from '../../util/pagination.js';
import { buildListingWhere, publishedEventsOnly } from './query.js';
import { PolicyError } from '../iam/permissions.js';
import type { SaveEventInput } from './validation.js';
import type { EventCardVm, EventListingFilters, EventListingResult } from './types.js';

export function createEventService(db: Database) {
	const repo = createEventRepository(db);

	async function getFeaturedOrFallback(): Promise<EventCardVm | null> {
		let featured = await repo.findFeatured();
		if (!featured) {
			const fallback = await repo.findEarliestPublished(1);
			featured = fallback[0];
		}
		return featured ? toEventCard(featured) : null;
	}

	return {
		listUpcomingForHome: async (limit = 3): Promise<EventCardVm[]> => {
			const rows = await repo.listUpcoming(limit);
			return rows.map(toEventCard);
		},

		getById: async (id: number): Promise<EventCardVm | null> => {
			const row = await repo.findPublishedById(id);
			return row ? toEventCard(row) : null;
		},

		getFeaturedOrFallback,

		listInMonth: async (year: number, month: number): Promise<EventCardVm[]> => {
			const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
			const end = new Date(year, month, 1, 0, 0, 0, 0);
			const rows = await repo.listInRange(start, end);
			return rows.map(toEventCard);
		},

		listListing: async (filters: EventListingFilters): Promise<EventListingResult> => {
			const offset = (filters.page - 1) * filters.limit;
			const whereClause = and(buildListingWhere(filters), publishedEventsOnly());

			// The page of results, the total count, and the featured event are three
			// independent queries — run them concurrently rather than one after another.
			const [paginatedEvents, countResult, featuredEvent] = await Promise.all([
				repo.listPage(whereClause, filters, offset),
				repo.countMatching(whereClause),
				getFeaturedOrFallback()
			]);
			const totalEvents = countResult[0]?.count ?? 0;
			const totalPages = Math.ceil(totalEvents / filters.limit);

			return {
				events: paginatedEvents.map(toEventCard),
				featuredEvent,
				pagination: {
					currentPage: filters.page,
					totalPages,
					totalEvents
				},
				filters: {
					search: filters.search,
					type: filters.type,
					sort: filters.sort
				}
			};
		},

		getAllEventsForAdmin: async () => {
			return repo.listAll();
		},

		/**
		 * One page of the admin list.
		 *
		 * Prefer this over `getAllEventsForAdmin`, which returns every row and
		 * exists for the CSV export.
		 */
		listForAdmin: async (request: PageRequest): Promise<Paginated<EventRow>> => {
			const [rows, countRows] = await Promise.all([
				repo.listForAdminPage(request.pageSize, request.offset),
				repo.countAll()
			]);

			return paginate(rows, countRows[0]?.value ?? 0, request);
		},

		/**
		 * Creates or updates an event.
		 *
		 * Input arrives already validated and sanitized by `saveEventSchema`, so
		 * this only deals with business rules: what an update may change, and
		 * what a new record defaults to.
		 */
		saveEvent: async (input: SaveEventInput) => {
			if (input.id) {
				const existing = await repo.findById(input.id);
				if (!existing) {
					throw new PolicyError('That event no longer exists.');
				}

				const updated = await repo.update(input.id, {
					title: input.title,
					description: input.description ?? '',
					date: input.date,
					location: input.location,
					imageUrl: input.imageUrl ?? null,
					type: input.type,
					price: input.price,
					capacity: input.capacity,
					isFeatured: input.isFeatured,
					status: input.status,
					// Stamp the publish time the first time it actually goes live.
					publishedAt:
						input.status === 'PUBLISHED' && !existing.publishedAt
							? new Date()
							: existing.publishedAt
				});

				return updated!;
			}

			return repo.insert({
				title: input.title,
				description: input.description ?? '',
				date: input.date,
				location: input.location,
				imageUrl: input.imageUrl ?? null,
				type: input.type,
				price: input.price,
				capacity: input.capacity,
				isFeatured: input.isFeatured,
				status: input.status,
				publishedAt: input.status === 'PUBLISHED' ? new Date() : null
			});
		},

		deleteEvent: async (id: number) => {
			await repo.delete(id);
		}
	};
}

