import { pgTable, serial, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';

export const sermonSeries = pgTable('sermon_series', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	coverImageUrl: text('cover_image_url'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const sermons = pgTable('sermons', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	slug: text('slug').notNull().unique(),
	speaker: text('speaker').notNull().default('Pastor / Speaker'),
	seriesId: integer('series_id').references(() => sermonSeries.id, { onDelete: 'set null' }),
	videoUrl: text('video_url'),
	youtubeId: text('youtube_id'),
	audioUrl: text('audio_url'),
	scripture: text('scripture'),
	summary: text('summary'),
	notes: text('notes'),
	discussionGuide: text('discussion_guide'),
	notesUrl: text('notes_url'),
	isLiveNow: boolean('is_live_now').default(false).notNull(),
	liveStreamUrl: text('live_stream_url'),
	thumbnailUrl: text('thumbnail_url'),
	isFeatured: boolean('is_featured').default(false).notNull(),
	publishedAt: timestamp('published_at', { withTimezone: true }).defaultNow().notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});
