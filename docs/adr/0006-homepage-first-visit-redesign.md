# 0006. Homepage redesign around the first-time visitor

Status: Accepted
Date: 2026-10-06

## Context

The audience is mostly young adults and students on Android phones and
expensive mobile data. A review of the live site against a well-regarded church
site found:

- the mobile hero showed no photo (a 38% image under a heavy gradient), while
  the page was about 16,000px tall on a phone;
- the hero carried unverified, hardcoded figures ("5,000+ Active Young Adults",
  "12+ Hubs") inside the component, not in the CMS;
- the public header carried a "Staff Portal" button, and the top bar offered an
  "Español" link that pointed at `#` on a site with no translation;
- the first thing a newcomer needs (when and where) had no home. The Plan a
  Visit page described the atmosphere but held no times or address;
- the homepage listed every group, testimonial and leader. Hero images were
  served at 2,560–3,120px wide, and two MP4s were 31 MB and 15 MB.

## Decision

- **Hero:** one photo, a headline, two buttons, and a quiet "next gathering"
  line taken from the events rail. No glass card, no pulsing badge, no stats.
  The hero video loads on desktop only; phones get the photo.
- **Intent tiles** ("Find your place": I'm new, Join a group, Serve, Watch) sit
  directly under the hero. They are code, not a CMS block, so they always
  appear and always point at routes that exist.
- **Staff Portal** moves to the footer. **Language links** show only when at
  least two languages link somewhere real.
- **Mobile bottom navigation** (Home, Events, Groups, Give) for phones. Hidden
  from `md` up.
- **Visit details are data, not copy.** `siteExtras` gains `visitTimes`,
  `visitAddress`, `visitNotes` and `visitMapUrl`, edited in the staff portal and
  validated by `visitDetailsSchema` (ADR 0005; the map link is `http(s)` only).
  The public page shows the section only when something is filled in, so
  nothing is ever invented.
- **Homepage previews are capped:** 6 groups, 4 testimonials. Leaders stay
  complete because their order is the hierarchy, but sit two across on phones.
- **Images were recompressed in place** (long edge 1920px, same filenames, so no
  database or CMS reference changes) and both MP4s re-encoded.

## Consequences

- The intent tiles and their wording are not editable from the CMS. Changing
  them is a code change. That is deliberate: they are navigation, not content.
- "In N days" in the hero is computed when the page renders. The `content`
  cache profile (`apps/web/src/lib/server/cache.ts`) can serve it for a while, so the
  label can lag by up to the cache window; the date beside it is exact.
- Saving the staff Settings form overwrites the four visit fields. An empty
  field clears the value.
- The bottom bar is fixed UI that reserves space under the footer. A new
  full-height or sticky-bottom element on a public page has to account for it.
- Recompression is lossy and the originals now live only in git history. There
  are still no responsive `srcset` sizes or WebP/AVIF variants, and the old
  binaries are still in history. See the image item in `BACKLOG.md`.
- Testimonials and the position of the "I'm new" section are CMS data and were
  not touched. Placeholder testimonials must be unpublished by staff.
