# Trailblazers — agent guide

SvelteKit + Drizzle + Turborepo monorepo for the PAOZ Trailblazers church
platform. `apps/web` is the public site (port 5173), `apps/admin` the staff
portal (port 5174). Shared code lives in `packages/core` (database, services,
schemas) and `packages/ui` (Svelte components and design tokens).

`architecture_example/kura-main/` is a **reference copy of a different project**,
kept for architectural comparison. It is not part of the build. Never edit it,
never run its scripts, and do not mistake its layout (`apps/chamber`, `owner`,
`member`, vitest suites) for this repo's.

## Where the instructions live

- `.agents/rules/` — always-on rules. Read both before writing code:
  - `code-style.md` — TDD-first; prove a fix with a failing test before claiming
    it works. Also holds the 3-layer architecture and design-token rules.
  - `feature-workflow.md` — plan → execute → verify for new features.
- `.agents/skills/` — task-specific guides, loaded when relevant. Includes
  `issue-tracking`, `drizzle`, `svelte-components`, `backend-patterns`,
  `postgres-patterns`, `tdd-workflow`, `web-component-design`,
  `integration-javascript_node`, `caveman`, plus auth/email/Stripe sets. List
  the directory rather than trusting this list to stay current.

Skills are mirrored to `.claude/skills/` as plain copies, not symlinks. **When
you add or edit a skill, update both directories** or the two toolchains drift.
They have already drifted: `integration-javascript_node`, `postgres-patterns`
and `skills` exist only under `.agents/skills/`. This file is mirrored the same
way — **`GEMINI.md` and `CLAUDE.md` must stay identical**; edit one, copy to the
other.

## Layout

| Path | What it is |
|---|---|
| `apps/web` | `@trailblazers/web` — public site, seed script, Vercel adapter |
| `apps/admin` | `@trailblazers/admin` — staff portal, session login |
| `packages/core` | `@trailblazers/core` — db client, schema, per-domain modules |
| `packages/ui` | `@trailblazers/ui` — shared Svelte components, `tokens.css` |
| `drizzle/` | generated SQL migrations |
| `tests/` | Playwright E2E specs (repo root, not per-app) |
| `scripts/` | `db-health-check.js`, `vercel-postbuild.js`, the test-runner TS hook |
| `src/` (repo root) | **legacy leftover**, outside the workspaces — not built, not deployed. Do not add to it; edit `apps/web` instead. |

`packages/core/src/modules/<domain>/` is the unit of backend work — each holds
some of `schema.ts`, `repository.ts`, `service.ts`, `mappers.ts`, `types.ts`.
Services are wired together in `services-factory.ts` and re-exported from
`packages/core/src/index.ts`; **a new service is invisible until you register it
in both.**

## Architecture

Repository → Service → Controller, as spelled out in `.agents/rules/code-style.md`:

- **Repository** (`packages/core/src/modules/*/repository.ts`) — raw Drizzle
  calls, no business logic.
- **Service** (`packages/core/src/modules/*/service.ts`) — validation,
  sanitization (`Sanitizer`), business rules; may call several repositories.
- **Controller** (`apps/{web,admin}/src/routes/**/+page.server.ts`) — SvelteKit
  load functions and form actions; parses FormData, shapes responses, calls
  services. No Drizzle here.

**Never hardcode hex colours.** Use the variables in
`packages/ui/src/tokens.css` — `--zinc-50`…`--zinc-950`, `--brand-primary`,
`--brand-fg`, `--color-border`. Prefer `@trailblazers/ui` components over raw
markup. Vanilla CSS with variables; Tailwind is present but tokens win for
colour.

## Commits

Reference the issue in the subject as a trailing `(#N)`, e.g.
`fix(events): save the banner uploaded during initial event creation (#198)`, so
the commit is linked on the issue and appears in the PR.

**Never use a closing keyword** (`fixes #N`, `closes #N`, `resolves #N`). They
auto-close the issue on merge, skipping the `need testing` verification the team
relies on. A bare `(#N)` links without closing; `fix(scope):` as a commit type is
safe, since the keyword only fires directly before a reference.

In the body, say **why** the change was needed and what you verified — not just
what changed. State the root cause when fixing a bug.

## Issue tracking

Detail in `.agents/skills/issue-tracking/SKILL.md`. The parts that cause damage
if you get them wrong:

- **`pull` overwrites `issues.csv` wholesale.** Run `push --dry-run` first to
  capture pending label edits, then reapply them after pulling.
- **Never run `push` without asking.** It writes labels to real client-visible
  issues and posts comments that @-mention real people. `push --dry-run` is
  always safe; `pull` is read-only.
- A fixed-but-unverified issue gains the **`need testing`** label. It stays open
  until a human verifies and closes it. The label means the fix is **pushed and
  testable**, not merely committed — check `git log origin/main..HEAD` first.
- **Claim before you start.** If an issue is assigned to someone else, skip it.
  If it is unassigned and you are about to work it, assign yourself first via
  `POST /repos/{repo}/issues/{n}/assignees`, which adds rather than replaces so
  another member's ownership is never displaced.
- Verification steps go in `issue-guides/<number>.md`, read at push time. No file
  means no comment — never invent a generic placeholder guide.
- The CSV has multi-line quoted cells. Parse it with a real CSV reader, never
  line-by-line.
- The CSV **cannot create issues** — rows with no remote counterpart are skipped.
  File via `POST /repos/{repo}/issues`.

Note: `issues.csv`, `issue-guides/`, `scripts/github-sync.ts` and `GITHUB_TOKEN`
in `.env` are **not present in this checkout**. The skill's workflow applies once
they are set up; until then, work issues directly on GitHub under the same rules.

## Verifying your work

Do not claim a change is verified because it compiles.

- **Unit tests: `npm test`.** Node's built-in runner executes the TypeScript
  sources directly — no vitest, no build step, no extra dependency. Tests live
  beside their subject as `*.test.ts` under `packages/*/src`.
  - `scripts/ts-resolve-hook.mjs` is what makes this work: the codebase writes
    relative imports with a `.js` extension, which Node does not resolve to
    `.ts` on its own. Run tests through `npm test`, not bare `node --test`.
  - Services are tested with a small hand-rolled fake `Database` — see
    `packages/core/src/modules/inquiries/service.test.ts` for the pattern.
    No Postgres required.
- Typecheck: `npm run check:web`, `npm run check:admin`, or `npm run check`.
- Lint and format: `npm run lint`, `npm run format`.
- Build: `npm run build:web` / `npm run build:admin`.
- **Check the baseline before blaming your change.** `svelte-check` reports
  pre-existing errors. Stash your work and re-run to compare rather than
  assuming you broke it.
- E2E: `npx playwright test`. The config now starts **both** apps (web 5173,
  admin 5174), because the admin specs use absolute `localhost:5174` URLs.
- E2E needs a seeded database and the `admin@paoz.test` / `password123` account
  the admin spec logs in with. Seed with `npm run seed`.
- A red test is evidence about the code, not a number to adjust. If a guardrail
  test fails, fix the code it guards — do not raise its threshold. This applies
  specifically to the hardcoded-colour ratchet in
  `packages/ui/src/tokens.test.ts`.
- Run the app natively for real-database work: `npm run dev:web` or
  `npm run dev:admin` from the repo root. Use the workspace scripts; running
  `vite` from the repo root breaks SvelteKit's root resolution.

## Validation and controllers

- Input validation is **zod schemas in the module's `validation.ts`**, applied
  by `handleAction` in `apps/admin/src/lib/server/actions.ts`. A controller
  declares its section, schema, what to do and what to audit; parsing,
  sanitization, authorization, error handling and the audit entry are handled
  once, centrally.
- `apps/admin/src/routes/events/+page.server.ts` is the reference. Most other
  admin routes still hand-parse `FormData` — convert the one you are working in
  rather than copying the old shape.
- Sanitization lives in the field helpers in `packages/core/src/util/form.ts`,
  so it applies automatically. Use `optionalUrl()` for anything rendered into
  `href` or `src`: plain `z.string().url()` accepts `javascript:`.
- **Colour is defined once**, in `packages/ui/src/tokens.css`, imported by both
  apps. Each colour has a hex form for hand-written CSS and an `-rgb` channel
  form that the Tailwind configs read so opacity modifiers work. Change both;
  `tokens.test.ts` fails if they disagree.

## Performance and caching

- Public routes set a cache profile via `apps/web/src/lib/server/cache.ts`
  (`static` / `content` / `dynamic` / `private`). These are `s-maxage` values
  aimed at the CDN, with `max-age=0` so a visitor's own browser still
  revalidates. **A page that renders anything about the signed-in visitor must
  use `private`.**
- Admin lists paginate through `readPageRequest` / `paginate` in
  `packages/core/src/util/pagination.ts`, which clamps `?pageSize` — an
  unclamped page size is a free denial-of-service on a one-connection pool.
- Dashboard tiles come from `services.dashboard.getCounts()`, which is
  `SELECT count(*)` per table in parallel. Do not go back to calling
  `getAllForAdmin()` and taking `.length`.
- **Still outstanding:** `apps/web/static/images` is 86 MB, including a 31 MB
  and a 15 MB MP4 served directly, and 46 MB of that is committed to git
  history. No responsive sizes, WebP/AVIF, or transcoding. For an audience on
  Zimbabwean mobile data this is the single most expensive thing on the site.

## Sensitive data

`packages/core/src/modules/prayer/` holds prayer requests, which can name a
diagnosis, a bereavement, or a family in trouble. Treat it as the most
sensitive table in the schema:

- requests are **private by default**; sharing is opt-in and never assumed;
- publishing needs **both** the submitter's consent and a separate staff
  decision — `visibility.ts` enforces this and is tested exhaustively;
- never log request text or who submitted it, and never put it in an email.
  The office notification says only that something arrived.

## Documentation

- `docs/DEPLOYMENT.md` — environment variables, migration ordering, rollback,
  and what each startup failure means.
- `docs/adr/` — why things are the way they are. Read before reversing a
  decision; add a new record rather than editing an old one.
- `docs/BACKLOG.md` — queued work, with the decision each item is blocked on.

## Email

`packages/core/src/modules/email/service.ts` sends through Resend over plain
`fetch`. Without `RESEND_API_KEY` it logs instead of sending, so local
development and CI are unaffected and nothing is delivered from a dev machine.
`EMAIL_FROM` must be on a Resend-verified domain; `OFFICE_EMAIL` receives staff
notifications. Sends never throw — a failed notification must not fail the
visitor's form submission.

## Database

Schema lives in `packages/core/src/db/schema.ts` (the single file
`drizzle.config.ts` points at); per-domain table definitions are in
`packages/core/src/modules/*/schema.ts`. Migrations are generated into
`drizzle/`.

**Use the tracked migration workflow** — `npm run db:generate`, then
`npm run db:migrate`. `.agents/rules/code-style.md` forbids `db:push`.

**`.github/workflows/db-seed.yml` is destructive but now contained.** `npm run
seed` still begins by `DELETE`-ing every table, users included. The workflow is
pinned to its ephemeral Postgres service container, has no push trigger, and
refuses to run unless a human dispatches it and types `SEED`. **Never point its
`DATABASE_URL` at a secret, and never give it a push trigger** — that
combination previously meant an ordinary schema commit would wipe production.

`npm run db:health` (`scripts/db-health-check.js`) checks connectivity and record
counts; CI runs it before and after every migration. Run it when a change smells
like a connection problem rather than a logic bug.

`status`-style columns are usually `varchar`, not Postgres enums, so adding a new
status value is a code change with no migration.

Local Postgres: `docker compose up -d db`. `compose.yaml` reads `DB_USER`,
`DB_PASSWORD` and `DB_NAME` from the repo-root `.env` (it used to pass the
literal strings `env.DB_USER` and so on, so the container came up with those as
its real credentials). Production uses a serverless pooler; prepared statements
are disabled for PgBouncer compatibility, so do not re-enable them.

## Auth and sessions

- The staff portal is guarded **per section**, not just per role.
  `packages/core/src/modules/iam/permissions.ts` is the single source of truth:
  `/users`, `/settings` and `/audit-logs` are ADMIN-only; everything else is
  open to ADMIN and SECRETARY.
- **SvelteKit runs a form action before it re-runs layout loads.** A guard in
  `+layout.server.ts` therefore does **not** protect POSTs. Every action in an
  admin-only section must call `requireSection` itself.
- Sessions are stored as an **HMAC of the cookie token**, keyed by `SECRET_KEY`.
  The raw token never reaches the database, so a leaked backup cannot be
  replayed. Rotating `SECRET_KEY` signs everyone out and voids every
  outstanding invite link.
- Expiry slides on use (7 days idle) but is capped at 30 days absolute, and the
  expiry is only rewritten once a session passes halfway — a write per request
  would be far too expensive on serverless.
- New accounts get a random unusable password hash and an **invite link** from
  `/set-password`. The link is shown once in the admin UI rather than emailed,
  because the email service is still a stub that only logs.

## Environment

`.env` at the repo root, modelled on `.env.example`: `DATABASE_URL`,
`SECRET_KEY`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `WEB_PORT`, `ADMIN_PORT`.
`turbo.json` lists these under `globalEnv` — **a new env var must be added there
too**, or Turbo's cache will serve builds that never saw it. Never print secret
values into a terminal, a commit, or an issue comment.

`SECRET_KEY` is load-bearing: it keys the session HMAC. Both apps refuse to
start in production without a real one (see `hooks.server.ts`), so it can no
longer be left at the `.env.example` placeholder.

## CI

Five workflows in `.github/workflows/`:

- `web-ci.yml` / `admin-ci.yml` — typecheck + build on pushes touching that app
  or `packages/**`.
- `quality.yml` — `npm test`, ESLint, Prettier, and the Playwright suite
  against an ephemeral Postgres. **Runs on Node 22**, which the test runner
  requires for type stripping; do not lower it.
- `db-migrate-health.yml` — health check → migrate → health check on schema
  changes.
- `db-seed.yml` — **destructive, see the Database section.** Manual dispatch
  only, pinned to a throwaway container.

Treat anything that runs `seed` or `db:push` as destructive and confirm before
triggering it. `dependabot.yml` raises grouped dependency PRs weekly.

## Working principles

- **TDD-first.** Prove a fix with a failing check before claiming it works.
  Assume your solution is wrong until something you ran says otherwise.
- **Audit your own work.** If something did not work, find out why and avoid it
  next time.
- Break a large task into small actionable steps; keep `task.md` /
  `implementation_plan.md` / `walkthrough.md` current per
  `.agents/rules/feature-workflow.md`. Create only the artifacts you need.
- SOLID, DRY, KISS. Strict TypeScript; interface the inputs of service methods.
- Log through `logger` from `@trailblazers/core`, whose signature is
  `logger.info(module, message, details?)` — e.g.
  `logger.info('EventSave', 'saved', { id })`. Keep the module tag and message
  low-cardinality; put the varying values in `details`. Never render an
  internal error to the browser: log it and return a generic message.
- Do not add backwards-compatibility shims unless asked — update the downstream
  consumers instead.
- Assume your world knowledge is out of date; check current docs before relying
  on framework or API details.
- If a terminal command fails three times, stop and ask the user to run it.
