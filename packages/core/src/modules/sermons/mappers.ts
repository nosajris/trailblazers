import { publicMediaUrl } from '../../util/public-media-url.js';
import type { sermons } from './schema.js';

export type SermonCardVm = {
	id: number;
	title: string;
	slug: string;
	speaker: string;
	scripture: string | null;
	summary: string | null;
	publishedAt: Date | null;
	thumbnailUrl: string | null;
	youtubeId: string | null;
	isLiveNow: boolean;
	/** Where to send someone who wants to watch it; always an internal path. */
	watchHref: string;
};

export type SermonDetailVm = SermonCardVm & {
	notes: string | null;
	/** Questions for a group to work through after the message. */
	discussionGuide: string | null;
	notesUrl: string | null;
	audioUrl: string | null;
	liveStreamUrl: string | null;
	series: { title: string; slug: string } | null;
};

export type SeriesCardVm = {
	id: number;
	title: string;
	slug: string;
	description: string | null;
	coverImageUrl: string | null;
	messageCount: number;
	latestPublishedAt: Date | null;
};

type Row = typeof sermons.$inferSelect;

/**
 * The view model the public site needs for one message.
 *
 * Pages used to receive the whole sermon row, including staff-only notes and
 * raw media paths. This keeps the public surface to what a card renders.
 */
export function toSermonCard(row: Row): SermonCardVm {
	return {
		id: row.id,
		title: row.title,
		slug: row.slug,
		speaker: row.speaker,
		scripture: row.scripture ?? null,
		summary: row.summary ?? null,
		publishedAt: row.publishedAt ?? null,
		thumbnailUrl: publicMediaUrl(row.thumbnailUrl),
		youtubeId: row.youtubeId ?? null,
		isLiveNow: row.isLiveNow ?? false,
		// Every message has its own page; it used to be '/watch' for all of them,
		// which is why no message could be shared or indexed.
		watchHref: `/watch/${row.slug}`
	};
}

/** One message's full page, including the material a group leader needs. */
export function toSermonDetail(
	row: Row,
	series: { title: string; slug: string } | null
): SermonDetailVm {
	return {
		...toSermonCard(row),
		notes: row.notes ?? null,
		discussionGuide: row.discussionGuide ?? null,
		notesUrl: row.notesUrl ?? null,
		audioUrl: row.audioUrl ?? null,
		liveStreamUrl: row.liveStreamUrl ?? null,
		series
	};
}

type SeriesRow = {
	id: number;
	title: string;
	slug: string;
	description: string | null;
	coverImageUrl: string | null;
	messageCount: number | string;
	latestPublishedAt: Date | string | null;
};

export function toSeriesCard(row: SeriesRow): SeriesCardVm {
	return {
		id: row.id,
		title: row.title,
		slug: row.slug,
		description: row.description ?? null,
		coverImageUrl: publicMediaUrl(row.coverImageUrl),
		messageCount: Number(row.messageCount),
		latestPublishedAt: row.latestPublishedAt ? new Date(row.latestPublishedAt) : null
	};
}
