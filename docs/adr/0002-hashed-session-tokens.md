# 0002. Store session tokens hashed, keyed by SECRET_KEY

Status: Accepted
Date: 2026-09-01

## Context

Sessions were stored as the raw cookie value: `sessions.id` held exactly the
string the browser sent back. Anyone who could read that table — a leaked
backup, a log line, a SQL injection, a support engineer with production access —
held every live session and could replay them directly.

Separately, `SECRET_KEY` was declared in `.env`, `.env.example`, `turbo.json`
and both CI workflows, and was read by no code at all. It looked like a security
control while providing nothing.

Sessions also never expired in practice: rows were filtered by `expiresAt` at
read time but never deleted, so the table grew without bound, and expiry was a
fixed 7 days with no sliding window and no absolute ceiling.

## Decision

The cookie carries a 32-byte random token. The database stores only
`HMAC-SHA256(token, SECRET_KEY)`. Lookup hashes the incoming cookie and matches
on the hash, so the stored value is never a usable credential.

`SECRET_KEY` becomes load-bearing: both apps refuse to start in production
without a usable one (present, at least 32 characters, not the example value).

Expiry slides 7 days on use but is capped at 30 days absolute from creation.
The expiry is only rewritten once a session passes the halfway mark, because a
write on every request is far too expensive on serverless. Expired rows are
swept opportunistically at login.

The same construction covers invite and password-reset tokens.

## Consequences

- **Rotating `SECRET_KEY` signs everyone out and voids every outstanding invite
  link.** That is the correct behaviour after a leak, but it makes rotation a
  scheduled, announced operation rather than routine hygiene.
- Deploying this change invalidated all existing sessions once, since old
  plaintext ids no longer match their hashed form.
- Seeded demo sessions in `data.ts` no longer validate. They were never used for
  anything real.
- Session validation now costs one HMAC per request. Negligible next to the
  database round trip it accompanies.
