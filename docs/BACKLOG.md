# Product backlog

Queued work, with the decision each item needs before it can start and the
reason it matters. Ordered roughly by value per unit of effort for a church
platform serving a Zimbabwean audience on mobile data.

Effort is rough: **S** ≈ a day, **M** ≈ a few days, **L** ≈ a week or more.

Items marked **Done** were built and are listed for context.

---

## Shipped in this pass

| Item | Notes |
|---|---|
| Prayer requests | Submission with confidentiality handling, staff follow-up queue. |
| PWA / offline caching | Service worker, offline fallback, cached shell. |
| Media upload | Behind a storage adapter — **production backend still undecided**, see below. |
| i18n scaffold | Plumbing and locale resolution. **Shona and Ndebele copy needs a translator.** |

---

## Blocked on a decision

### Media library — production storage backend
**Effort: S once decided.** The upload service and admin picker are built
against a storage adapter with a local-filesystem implementation. Serverless
functions have an ephemeral filesystem, so the local adapter is **development
only** — production needs a real backend before this ships.

Options: Vercel Blob (simplest, same vendor, per-GB pricing), S3 or R2
(cheapest at volume, more setup), Cloudinary (does transcoding and responsive
variants for you, which the image problem below also needs).

Given the 86 MB media problem, a backend that transcodes is worth paying for.

### i18n — actual translations
**Effort: M, mostly not engineering.** `languageOptions` exists in site
settings and now drives locale resolution. The English catalogue is complete;
Shona and Ndebele are empty and need a human translator. Machine translation of
liturgical and pastoral language is not appropriate here.

### Analytics — which host
**Effort: S.** The `integration-javascript_node` PostHog skill is vendored.
Needs a project key and a decision on self-hosting versus cloud, plus a privacy
notice, since this is congregant data. The CSP in `svelte.config.js` will need
the analytics origin added to `connect-src`.

---

## Highest value next

### Image and video pipeline
**Effort: M. No decision needed to start.**
*Partly done (see ADR 0006):* the large JPEGs were recompressed in place and
both MP4s re-encoded, taking `apps/web/static/images` from about 86 MB to roughly
25 MB. What remains is below.

Originally `apps/web/static/images` was 86 MB, including a 31 MB and a 15 MB MP4
served directly, and twelve images over 1.4 MB. 46 MB of that is in git history,
which is why `.git` is 139 MB.

For an audience paying by the megabyte this is the single most expensive thing
on the site — more than every query and render decision combined.

Work: move video to a streaming host, generate WebP/AVIF with responsive
`srcset`, lazy-load below the fold, and consider `git-lfs` or history rewriting
for the committed binaries. Pairs naturally with the media-library storage
decision.

### Newcomer follow-up sequence
**Effort: M.** A visit registration currently creates one task and stops. There
is no sequence, no reminder, and no record of whether anyone followed up.
Now that transactional email works, a scheduled multi-step sequence (day 1
welcome, day 7 check-in, day 30 invitation to a group) is straightforward and
directly serves the newcomer ministry.

### Scheduled publishing and draft preview
**Effort: M.** `status` and `publishedAt` columns exist on most content tables;
nothing schedules. Staff cannot preview a draft without publishing it. Needs a
cron trigger (Vercel Cron) and a signed preview URL.

---

## Worth doing, no urgency

### Sermon pipeline
**Effort: L.** Upload, podcast RSS feed, transcripts, series pages. The
`sermons` and `sermon_series` tables already exist and `/watch` renders them.
A podcast feed is the highest-value slice and is small on its own. Transcripts
are also an accessibility and SEO win.

### Volunteer rota and scheduling
**Effort: L.** Builds on the `serve` module, which currently only collects
applications. Needs recurring schedules, availability, swaps, and reminders —
a genuinely complex domain. Do not start it without talking to whoever runs
the rota today.

### Attendance and discipleship tracking
**Effort: L.** `statistics` is district-level and manually entered. Per-person
attendance is a different and much more sensitive dataset: it needs a
retention policy and a clear answer about who can see it before any schema is
written.

### BEP marketplace: search, filter, self-service claim
**Effort: M.** `bep_profiles` has `isVerified` and `status` but no way for a
business owner to claim or update their own listing, and no search. Needs a
verification workflow and probably member accounts first.

### Multi-district scoping
**Effort: L.** Districts exist in `statistics` but nowhere in the permission
model, so a leader in one district sees everything. This is a cross-cutting
change to `permissions.ts`, every query, and the seed data. Do it before the
platform has many districts, not after.

---

## Depends on member accounts

Several items above assume a non-staff auth surface that does not exist yet.
Member accounts were deliberately deferred: they widen the attack surface, and
the staff auth surface was only just hardened.

Blocked on it: group signup tied to a person rather than an email, giving
history, serving schedules, BEP self-service claim.

---

## Needs content, not code

These are built and waiting on someone with the facts. Each renders nothing
until it is filled in (ADR 0008).

| Item | Where |
|---|---|
| Service times, address, map link | Staff portal → Settings → Plan a Visit Details |
| Campuses (id, name, times, address, map) | Staff portal → Settings → Campuses |
| Giving methods and what giving pays for | Staff portal → Settings → Giving Details |
| WhatsApp number and greeting | Staff portal → Settings → WhatsApp |
| Real testimonials | Staff portal → Testimonials. The placeholders should be unpublished — a fake quote is the fastest way to lose a first-time visitor. |

## Deliberately not done in the Elevation pass

### Consolidate the ministry bands into one card grid
**Effort: M.** `IM_NEW`, `SERVE` and `PARENTS` each render as a full-width
`RichSection`, so three near-identical bands stack up. Elevation uses a single
six-card ministry grid. Doing this properly needs a new CMS block kind and a
page-builder change, not a styling tweak.

### Real event reminders
**Effort: M, plus a decision.** "Remind me on WhatsApp" prefills a message the
person sends themselves. Sending an actual reminder later needs a messaging
provider, a schedule, and consent records of the same standard as the
newsletter (see `newsletter_subscribers`).

### File sizes on downloads
**Effort: S.** Worth doing for anything we host and can measure. Not done
because the only download today is a generated `.ics` of a couple of
kilobytes, and sermon note links are external URLs whose size we cannot know
without fetching them.

### Delete the unused background videos
**Effort: S.** `apps/web/static/images/camp-video.mp4` (9.5 MB) and
`camp02.mp4` (7.9 MB) are referenced nowhere in the codebase. They are 17.5 MB
of the 30.4 MB static total. Confirm nothing external links to them, delete
them, and lower `MAX_TOTAL` in `packages/ui/src/page-weight.test.ts` to about
14 MB to lock the saving in.

## From the all-pages audit — still open

### Rich text for stories
**Effort: M.** A story's body renders as one `<p>` with `whitespace-pre-line`,
inside a `prose` container that has nothing to style. No headings, links, lists
or inline images are possible. Needs a decision on the editing format
(Markdown is the obvious one) plus sanitisation on render, which is why it was
not bundled with the audit fixes.

### Safeguarding information for parents
**Effort: S, plus policy.** A parent deciding about a youth camp has no page
answering who supervises, what the ratios are, or who to call. The content is a
policy question for the leadership, not a code question; the page is small once
the answers exist.

### Past events and camp photos
**Effort: M.** `/events` shows upcoming events only, so the proof that camps are
good — photos and recaps of previous ones — is nowhere. Needs a decision on
whether past events stay listed and where galleries are stored.

### A page at `/` in the CMS
**Effort: S.** With the section editor in place, the homepage can finally be
built in the portal. Until someone creates a page with slug `/` and adds
sections, `buildFallbackBlocks()` supplies a hero nobody can edit. Build it,
check the public homepage matches, then consider removing the fallback.
