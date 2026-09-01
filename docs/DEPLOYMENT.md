# Deployment runbook

Two SvelteKit apps deploy independently to Vercel from the same repository:
`apps/web` (public site) and `apps/admin` (staff portal). Each has its own
`vercel.json` pointing at a shared install and a filtered Turbo build.

---

## Required environment variables

Set these per Vercel project, for every environment you deploy.

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | **Yes** | Serverless pooler URL. The app refuses to boot without it. |
| `SECRET_KEY` | **Yes** | Keys the session HMAC. At least 32 random characters. |
| `NODE_ENV` | Yes | `production` |
| `RESEND_API_KEY` | No | Absent means email is logged, not sent. |
| `EMAIL_FROM` | With Resend | Must be on a Resend-verified domain. |
| `OFFICE_EMAIL` | With Resend | Where staff notifications land. |

Generate a secret key with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

**A new variable must also be added to `globalEnv` in `turbo.json`**, or Turbo's
cache will serve a build that never saw it.

### Rotating `SECRET_KEY`

It signs sessions and password tokens. Rotating it:

- signs every staff member out immediately;
- voids every outstanding invite and password-reset link.

That is the correct response to a suspected leak. Warn the team first, and be
ready to re-issue invites.

---

## Deploying

Vercel builds on push to `main`. Before merging anything that touches the
database, read the migration section below — the order matters.

```bash
npm ci
npm test                 # unit suite
npm run check:web
npm run check:admin
npm run build:web
npm run build:admin
```

CI (`quality.yml`, `web-ci.yml`, `admin-ci.yml`) runs the same things. If CI is
green and the build is green, the deploy is very likely fine.

---

## Database migrations

**Always the tracked workflow.** `db:push` is forbidden outside the disposable
CI database.

```bash
npm run db:generate      # writes SQL + snapshot into drizzle/
npm run db:migrate       # applies it
npm run db:health        # connectivity and record counts
```

Commit the generated files in `drizzle/` together with the schema change —
`db:generate` writes both SQL and a snapshot, and separating them desynchronises
future generates.

### Order of operations

The migration runs **before** the new code is live, so every migration must be
backwards compatible with the currently deployed build for the length of the
deploy:

- adding a nullable column or a new table is safe;
- dropping or renaming a column is **not** — do it in two releases: stop reading
  it, deploy, then drop it in the next one.

`db-migrate-health.yml` runs health → migrate → health automatically on pushes
touching schema files.

---

## The destructive workflow

`.github/workflows/db-seed.yml` wipes and re-seeds every table, users included.

It is pinned to a throwaway Postgres service container, has **no push trigger**,
and refuses to run unless a human dispatches it and types `SEED`.

**Never** point its `DATABASE_URL` at a secret and **never** give it a push
trigger. That combination previously meant an ordinary schema commit would wipe
production.

---

## Rollback

1. **Code**: redeploy the previous deployment from the Vercel dashboard. Both
   apps roll back independently.
2. **Database**: there is no automatic down-migration. If the release included a
   migration, roll the code back first, confirm the old build works against the
   new schema (it should, if the migration was backwards compatible), then write
   a forward migration to undo the change. Do not hand-edit the schema.
3. Run `npm run db:health` after any database intervention.

---

## Health checks

Both apps expose `GET /api/health`, unauthenticated:

```json
{ "status": "ok", "app": "web", "database": "connected", "timestamp": "…" }
```

It returns `503` with the same shape when the database is unreachable. It
deliberately reveals nothing else — driver errors name the host, database and
role, so those are logged instead.

Point uptime monitoring at both.

---

## Common failures

| Symptom | Likely cause |
|---|---|
| App refuses to start, logs `[Startup] DATABASE_URL … is not set` | Missing env var. This is deliberate — it used to fall back to localhost and 500 on every request instead. |
| App refuses to start, logs `SECRET_KEY … too short` / `example value` | Placeholder secret still in place. |
| Everyone signed out after a deploy | `SECRET_KEY` changed. Expected. |
| Staff can sign in but `/users` bounces them to the dashboard | Working as intended: that section is ADMIN-only. |
| Emails not arriving | No `RESEND_API_KEY`, so the service logs instead. Check the function logs for `[INFO] [EMAIL]`. |
| `ECONNREFUSED` at request time | Database unreachable or pooler down. Run `npm run db:health`. |

---

## Local setup

```bash
cp .env.example .env      # then fill in DATABASE_URL and SECRET_KEY
docker compose up -d db
npm ci
npm run db:migrate
npm run seed              # destructive: wipes local data
npm run dev:web           # 5173
npm run dev:admin         # 5174
```

Seeded staff logins are in `apps/web/src/lib/server/data.ts`. They use weak,
well-known passwords and are for local and CI use only — **never seed a database
that real people can reach.**
