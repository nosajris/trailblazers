import { pgEnum, pgTable, serial, text, integer } from 'drizzle-orm/pg-core';

export const equipmentStatusEnum = pgEnum('equipment_status', ['AVAILABLE', 'RENTED', 'MAINTENANCE']);

export const equipment = pgTable('equipment', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	description: text('description'),
	status: equipmentStatusEnum('status').default('AVAILABLE'),
	dailyRate: integer('daily_rate').notNull(),
	imageUrl: text('image_url'),
	sortOrder: integer('sort_order').default(0)
});
