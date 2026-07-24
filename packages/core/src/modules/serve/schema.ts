import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const serveContent = pgTable('serve_content', {
	id: serial('id').primaryKey(),
	headline: text('headline').notNull(),
	subheadline: text('subheadline'),
	body: text('body'),
	ctaLabel: text('cta_label'),
	ctaHref: text('cta_href'),
	imageUrl: text('image_url'),
	sortOrder: integer('sort_order').default(0),
	status: text('status').notNull().default('PUBLISHED'),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});
