# 0003. Authorize the staff portal per section

Status: Accepted
Date: 2026-09-01

## Context

The entire staff portal was guarded by one predicate, `canAccessAdmin`, which
admitted both `ADMIN` and `SECRETARY`. That was the only check anywhere in
twenty-one admin routes.

`/users` was therefore reachable by a secretary, who could create accounts,
delete accounts, and set their own role to `ADMIN`. A privilege escalation
available to anyone with a secretary login.

The subtlety that made a page-level fix insufficient: **SvelteKit runs a form
action before it re-runs layout loads.** A guard in `+layout.server.ts` does not
protect a POST. A secretary could post straight to `/users?/saveUser` and the
action would execute before any layout code ran.

## Decision

Access is decided per section, not per role, in
`packages/core/src/modules/iam/permissions.ts` — a pure, import-free, directly
tested module.

- `users`, `settings`, `audit` — ADMIN only
- `content`, `submissions` — ADMIN and SECRETARY
- unmapped paths fall back to `content`, the permissive default, because content
  management is the bulk of the portal

Enforcement happens in two places, and both are required:

1. `+layout.server.ts` redirects on page loads;
2. **every action in a protected section calls `requireSection` itself**, since
   the layout guard does not run first for POSTs.

Beyond section access, an admin may not change their own role or delete their
own account, and the service refuses to remove the last remaining admin.

## Consequences

- Adding an admin-only route means adding it to `SECTION_BY_PREFIX`. Forgetting
  makes it content-accessible — permissive, not restrictive, which is the
  failure mode a reviewer is most likely to miss. The tests name this.
- Every new action in a protected section must call `requireSection`. The shared
  `handleAction` helper does it automatically; hand-written actions must not
  forget.
- Secretaries lost access to site settings and the audit log. That was a
  deliberate product decision, not a side effect.
