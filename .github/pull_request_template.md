<!--
Reference the issue in the PR title as a trailing (#N).

NEVER use a closing keyword — "fixes #N", "closes #N", "resolves #N" — in the
title, this description, or a commit message. They auto-close the issue on
merge, which skips the `need testing` verification the team relies on. A bare
(#N) links without closing.
-->

## What changed

<!-- One or two sentences. -->

## Why

<!-- The problem this solves. For a bug, state the root cause, not the symptom. -->

## How it was verified

<!--
"It compiles" is not verification. Say what you actually ran and what it showed.
-->

- [ ] `npm test`
- [ ] `npm run check:web` / `npm run check:admin`
- [ ] `npx playwright test` (needs a seeded database)
- [ ] Exercised by hand against a real database — describe the steps below

## Risk

- [ ] Touches authentication, authorization, or sessions
- [ ] Includes a database migration (`npm run db:generate` output committed)
- [ ] Changes a GitHub workflow
- [ ] Changes anything under `packages/ui` used by both apps

<!--
If you ticked "migration": say whether it is backwards compatible with the
currently deployed code, since the migration runs before the new build is live.
-->

## Anything reviewers should look at closely

<!-- Trade-offs, things you were unsure about, follow-ups you deliberately left. -->
