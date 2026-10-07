# ADR 0009: Editable page sections, and a page per message

- Status: Accepted
- Date: 2026-10-06

## Context

An audit of all fourteen public pages, read against what a visitor, a member, a
parent, a group leader and a crawler each need, turned up four problems that
shared one root cause: **content the church owns was living in the markup.**

- `/bep-hub` rendered four hardcoded hubs with invented street addresses,
  meeting times and host names — while the verified businesses and equipment it
  loads from the database were fetched and never rendered.
- `/messages` rendered four invented series, all linking to `/watch`, while the
  real `sermon_series` table went unused.
- `/messages`, `/serve`, `/watch` and `/stories/[id]` told visitors about the
  CMS: "Streaming links can be wired… when you are ready", "content is managed
  in the CMS", "Full article content is being prepared".
- `pages` and `page_sections` existed, the admin could create a page, and
  **nothing could be put on one.** That is why the public homepage renders
  `buildFallbackBlocks()` — a hardcoded hero nobody can edit.

Two further findings were not about content:

- `SeoMeta` — which documents itself as essential because a church spreads
  through links shared into WhatsApp groups — was applied to exactly one page,
  `/prayer`. Every other page had a bare `<title>`, so every share rendered as a
  naked URL. `/events` and `/events/[id]` had no `<title>` at all.
- No `tel:` or `mailto:` existed anywhere in the codebase. The only way to reach
  the church was a form.

## Decision

**Page sections are editable.** `/pages/[id]` in the staff portal adds, edits,
reorders, publishes and deletes the sections of any CMS page. `section-types.ts`
is the single definition of which fields each type takes, so the editor grows
the right inputs when a type is added, and `pageSectionSchema` validates what
lands in the `jsonb` config — image and video values reach `src` and `href`
attributes, so they are restricted to http(s) like every other such setting.

**`/about` is a CMS page.** It composes whatever sections staff add at the slug
`/about` and 404s until that page exists, rather than shipping a half-built
shell. `HomeBlocks` takes a `variant`, so a CMS page renders only its own
sections while the homepage keeps its injected rows.

**Every message has a page.** `/watch/<slug>` uses the `slug`, `scripture`,
`notes` and `discussionGuide` columns that were populated from the start and
publicly unreachable. `/messages/<slug>` lists a series. The discussion guide is
deliberately public: it is written for group leaders and was readable only
inside the portal.

**Metadata everywhere.** `SeoMeta` now derives its canonical URL from the
current page, minus the query string so a filtered view is not a second
canonical, and takes an optional `jsonLd` object. Every public page uses it.
Events carry `Event` data, the FAQ carries `FAQPage`, stories carry `Article`,
and messages carry `VideoObject`.

**Contact details are settings.** Phone, email, address, office hours and social
links render in the footer and on `/contact` as real `tel:` and `mailto:` links,
and nothing renders until they are filled in.

## Consequences

- The homepage keeps using its fallback blocks until someone builds a page at
  `/` in the portal. The fallback stays as the safety net; the difference is
  that editing is now possible.
- `/watch` ships view models rather than sermon rows, so staff-only notes and
  the discussion guide are no longer sent to every visitor of the index.
- The sitemap grows a URL per message, per series and per CMS page. That is the
  point: it previously held one `/watch` entry for every message.
- Editorial copy — "Come as you are", the three steps on Plan a Visit — stays in
  the markup. The line is that **facts about the church** (times, places,
  numbers, people, money) must be editable, while evergreen voice does not need
  a CMS field and would be worse for having one.
- Line-based list settings and `jsonb` section config are both weaker than a
  purpose-built editor. They were chosen because they are testable today and
  need no migration.
