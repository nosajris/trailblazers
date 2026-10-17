import { pgTable, serial, text, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from '../iam/schema.js';

/**
 * One uploaded-and-processed image. `url` is the capped-size webp (long edge
 * at most MAX_LONG_EDGE, see service.ts); `variants` holds the smaller webp
 * copies keyed by width, e.g. `{ "480": "https://...-480.webp" }`. Every
 * filename ends `-<width>.webp`, including `url` itself, so a renderer can
 * derive the whole srcset from `url` alone — see the CMS
 * branch of `responsiveSrcset` in `packages/ui/src/site/responsive-images.ts`.
 */
export const mediaAssets = pgTable(
	'media_assets',
	{
		id: serial('id').primaryKey(),
		url: text('url').notNull(),
		width: integer('width').notNull(),
		height: integer('height').notNull(),
		variants: jsonb('variants').$type<Record<string, string>>().notNull().default({}),
		uploadedBy: integer('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
		createdAt: timestamp('created_at').notNull().defaultNow()
	},
	(table) => [index('media_assets_created_idx').on(table.createdAt)]
);
