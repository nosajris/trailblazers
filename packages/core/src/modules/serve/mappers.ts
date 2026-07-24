import { publicMediaUrl } from '../../util/public-media-url.js';
import type { serveContent } from './schema.js';
import type { RichSectionVm } from './types.js';

type Row = typeof serveContent.$inferSelect;

export function toRichSectionVm(row: Row): RichSectionVm {
	return {
		id: row.id,
		headline: row.headline,
		subheadline: row.subheadline,
		body: row.body,
		ctaLabel: row.ctaLabel,
		ctaHref: row.ctaHref,
		imageUrl: publicMediaUrl(row.imageUrl)
	};
}
