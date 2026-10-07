/**
 * Dashboard counters.
 *
 * The admin dashboard used to build its KPI tiles by calling every module's
 * `getAllForAdmin()` and taking `.length` — eleven full table reads, every
 * hydrated row shipped from Postgres to the serverless function, on every page
 * load, to produce eleven integers. On a `max: 1` connection pool that is the
 * most expensive page in the portal.
 *
 * These are `SELECT count(*)` instead, which the existing indexes serve
 * directly.
 */

import { and, count, desc, eq, gt } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';
import type { Database } from '../../db/client.js';
import { bepProfiles } from '../bep/schema.js';
import { equipment } from '../equipment/schema.js';
import { events } from '../events/schema.js';
import { faqs } from '../faq/schema.js';
import { groups } from '../groups/schema.js';
import { inquiries } from '../inquiries/schema.js';
import { leaders } from '../leaders/schema.js';
import { sermons } from '../sermons/schema.js';
import { tasks } from '../tasks/schema.js';
import { testimonials } from '../testimonials/schema.js';

export type DashboardCounts = {
	totalSermons: number;
	totalEvents: number;
	upcomingEvents: number;
	totalGroups: number;
	totalLeaders: number;
	totalTestimonials: number;
	totalFaqs: number;
	totalInquiries: number;
	pendingInquiries: number;
	/** Plan-a-visit registrations from the last seven days. */
	newVisitorsThisWeek: number;
	pendingTasks: number;
	totalEquipment: number;
	totalBep: number;
};

export function createDashboardService(db: Database) {
	/** One `count(*)`, optionally filtered. */
	function countOf(table: PgTable, where?: SQL) {
		const query = db.select({ value: count() }).from(table);
		return where ? query.where(where) : query;
	}

	return {
		/**
		 * Every dashboard number in one round of parallel counts.
		 *
		 * They are independent queries, so they go out together rather than
		 * eleven sequential awaits.
		 */
		async getCounts(): Promise<DashboardCounts> {
			const [
				sermonRows,
				eventRows,
				upcomingRows,
				groupRows,
				leaderRows,
				testimonialRows,
				faqRows,
				inquiryRows,
				pendingInquiryRows,
				newVisitorRows,
				pendingTaskRows,
				equipmentRows,
				bepRows
			] = await Promise.all([
				countOf(sermons),
				countOf(events),
				countOf(events, and(eq(events.status, 'PUBLISHED'), gt(events.date, new Date()))),
				countOf(groups),
				countOf(leaders),
				countOf(testimonials),
				countOf(faqs),
				countOf(inquiries),
				countOf(inquiries, eq(inquiries.status, 'PENDING')),
				countOf(
					inquiries,
					and(
						eq(inquiries.type, 'VISITOR'),
						gt(inquiries.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
					)
				),
				countOf(tasks, eq(tasks.isCompleted, false)),
				countOf(equipment),
				countOf(bepProfiles)
			]);

			const value = (rows: { value: number }[]) => rows[0]?.value ?? 0;

			return {
				totalSermons: value(sermonRows),
				totalEvents: value(eventRows),
				upcomingEvents: value(upcomingRows),
				totalGroups: value(groupRows),
				totalLeaders: value(leaderRows),
				totalTestimonials: value(testimonialRows),
				totalFaqs: value(faqRows),
				totalInquiries: value(inquiryRows),
				pendingInquiries: value(pendingInquiryRows),
				newVisitorsThisWeek: value(newVisitorRows),
				pendingTasks: value(pendingTaskRows),
				totalEquipment: value(equipmentRows),
				totalBep: value(bepRows)
			};
		},

		/** Open tasks for the dashboard list, newest first and capped. */
		async listOpenTasks(limit = 10) {
			return db
				.select()
				.from(tasks)
				.where(eq(tasks.isCompleted, false))
				.orderBy(desc(tasks.createdAt))
				.limit(limit);
		}
	};
}
