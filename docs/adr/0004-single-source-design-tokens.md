# 0004. One definition of colour, with a ratchet

Status: Accepted
Date: 2026-09-01

## Context

`packages/ui/src/tokens.css` existed, was referenced by the always-on style
rule, and was **imported by nothing**. The admin app re-declared every token
inline in its own `app.css`; the web app repeated the same hex values in
`tailwind.config.ts`. Three copies of the palette, and they had already drifted:
`--brand-primary-hover` was `#e04a39` in the token file and `#ff7a6b` in admin.

Because the token file was dead code, the rule "never hardcode hex colours" was
unenforceable, and sixty-odd literals had accumulated behind it.

## Decision

`tokens.css` is the single definition and is imported by both apps.

Each colour appears in two forms:

- a hex (`--brand-primary`) for hand-written CSS;
- a space-separated RGB triplet (`--brand-primary-rgb`) that both Tailwind
  configs read as `rgb(var(--brand-primary-rgb) / <alpha-value>)`.

The second form is not redundant. Tailwind's opacity modifiers
(`bg-brand-primary/20`, `text-brand-dark/75`) need channels to inject an alpha
into; a `var()` holding a hex silently drops the modifier, which fails quietly
and looks like a design bug.

`packages/ui/src/tokens.test.ts` asserts the two forms agree, and ratchets the
count of hardcoded hex literals downward.

The `--brand-primary-hover` drift was resolved to `#ff7a6b` — the value both
apps actually rendered, since the token file was never loaded. Resolving toward
observed behaviour meant no visual change.

## Consequences

- Changing a colour means changing both its hex and its `-rgb` form. The test
  fails if they disagree, which is the point.
- The ratchet fails when a new hardcoded colour is added. **The fix is to use a
  token, never to raise the number.** Lower it when literals are migrated.
- Admin's `zinc` scale override was deleted: its values were identical to
  Tailwind's defaults, so it only created another copy to keep in sync.
- Any new app in this monorepo must import `tokens.css` or it gets no palette.
