# ADR 0008: Church-specific content lives in settings, not in the markup

- Status: Accepted
- Date: 2026-10-06

## Context

The public site promised things it could not deliver. `/give` said online
giving "is being configured". Three campuses were listed in site settings and
all three linked to `/contact`. The header carried a language switcher that
pointed at `#`. Several pages carried invented service times from an early
mock-up.

Every one of those is a fact about this church that only staff know. Hardcoding
a plausible value is worse than showing nothing: a wrong time or a stale bank
detail costs someone a Sunday morning or a payment.

A second gap: the audience is on WhatsApp and on metered mobile data. The site
offered a contact form and a background video that downloaded a megabyte of
YouTube player code before the first frame.

## Decision

**Church-specific facts are settings, validated at the boundary, and render
nothing until filled in.** `SiteExtras` gains:

- `whatsappNumber` / `whatsappGreeting` — digits only, so every `wa.me` link is
  built the same way. Empty hides the chat button.
- `givingMethods` / `givingNote` — what `/give` lists. Empty falls back to
  "ask the team" rather than implying online giving exists.
- `campuses` — now carries times, address and map link, and each entry gets a
  real page at `/campus/<id>`.

Lists that staff would otherwise need a repeater UI for are edited as one
record per line (`Name | Detail | Note`). The parsers in
`modules/settings/site-content.ts` are pure and unit tested, and the zod
schemas in `validation.ts` wrap them so a malformed line is reported under its
own field instead of being silently dropped.

**Nothing invented.** A section with no data does not render. The homepage
"In person or online" row appears only when campuses exist, because with none
it would repeat the tiles above it.

**Search is real.** `/api/search` ranks events, groups, messages, campuses and
pages through `packages/ui/src/site/search.ts`. The overlay that does this was
already in the codebase, hardcoded to four links and rendered on no page at
all; it is now in the site shell, so Ctrl/Cmd+K works everywhere.

**Data before polish.** The hero video is mounted only in the browser, and only
when the visitor is not on a metered or slow connection and has not asked for
reduced motion. The photo carries the hero otherwise, which is what every
phone already got.

## Consequences

- The site looks emptier until staff fill the settings in. That is the point.
- Line-based editing is a trade: no repeater UI to build, but a format to learn.
  The help text under each field carries an example, and a bad line fails the
  save with a message naming the line.
- `/campus/<id>` 404s for an id that is not configured, so removing a campus
  removes its page.
- Reminder and share links open WhatsApp with text prefilled; nothing is sent
  until the person taps send. Real reminders would need a messaging provider
  and consent records, which is a separate decision.
