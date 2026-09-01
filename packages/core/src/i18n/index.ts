/**
 * Message catalogues.
 *
 * `sn` (chiShona) and `nd` (isiNdebele) are intentionally empty. Every key
 * falls back to English, so the site is fully readable while translation is in
 * progress — and a translator can fill them in incrementally without a code
 * change beyond adding keys.
 *
 * Do not machine-translate these. Pastoral and liturgical language carries
 * meaning that a general-purpose translator gets wrong in ways that are hard
 * to notice and embarrassing to publish.
 */

import type { Locale, Messages } from '../util/i18n.js';
import { en } from './en.js';

/** chiShona. Awaiting a human translator — see docs/BACKLOG.md. */
export const sn: Messages = {};

/** isiNdebele. Awaiting a human translator — see docs/BACKLOG.md. */
export const nd: Messages = {};

export const catalogues: Record<Locale, Messages> = { en, sn, nd };

export { en };
