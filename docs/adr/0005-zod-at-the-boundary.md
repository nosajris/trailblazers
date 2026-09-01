# 0005. Validate and sanitize at the boundary with zod

Status: Accepted
Date: 2026-09-01

## Context

`zod` was a dependency of `packages/core` and was imported nowhere. There was no
schema validation in the system. All twenty-one admin controllers hand-parsed
`FormData` field by field:

```ts
const title = form.get('title')?.toString().trim();
if (!title) return fail(400, { error: 'Title is required' });
```

`Sanitizer` was used in exactly one module out of twenty-two, despite the rule
requiring sanitization in the service layer — because remembering to call it in
every service, every time, is not something people do reliably.

The repetition also meant the audit-log call was easy to forget, and error
handling drifted from route to route.

## Decision

Input shape is declared once per module in `validation.ts` as a zod schema, built
from shared field helpers in `packages/core/src/util/form.ts`.

**Sanitization lives in those helpers**, so it applies automatically at the
boundary rather than depending on a service author remembering. `requiredText`
strips tags and trims; `email` lowercases and strips whitespace.

`handleAction` in `apps/admin/src/lib/server/actions.ts` applies the schema and
handles parsing, authorization, error handling and the audit entry once,
centrally. A controller declares its section, schema, what to do and what to
record.

`optionalUrl()` rejects anything that is not `http:` or `https:`. Writing the
test for it revealed that zod's own `.url()` accepts `javascript:alert(1)` —
which, in a CMS field rendered into `href` or `src`, is a stored-XSS sink.

## Consequences

- Validation errors return per-field, so forms can show a message under each
  input plus a summary.
- Unknown form fields are dropped rather than passed through, so a crafted POST
  cannot smuggle a field the service would trust.
- The `events` module is the reference implementation. The other modules still
  hand-parse; convert them opportunistically rather than in one large unverified
  sweep.
- Sanitizing at the boundary means services now receive clean input and should
  not re-sanitize. Double-sanitizing is harmless but signals confusion about
  where the boundary is.
