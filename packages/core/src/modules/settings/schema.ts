import { jsonb, pgTable, text } from 'drizzle-orm/pg-core';

export const siteSettings = pgTable('site_settings', {
	key: text('key').primaryKey(),
	value: jsonb('value').$type<unknown>().notNull()
});
