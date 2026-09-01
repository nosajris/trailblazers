# Architecture decision records

Short notes on decisions that would otherwise be re-litigated or, worse,
silently reversed by someone who did not know why they were made.

One file per decision, numbered in order. A record is immutable once merged: if
a decision changes, write a new record and mark the old one superseded rather
than editing history.

## Format

```markdown
# NNNN. Short title

Status: Accepted | Superseded by NNNN
Date: YYYY-MM-DD

## Context
What forced a decision.

## Decision
What was decided, in the active voice.

## Consequences
What this costs, and what it now makes hard.
```

## Index

| # | Title | Status |
|---|---|---|
| [0001](0001-node-builtin-test-runner.md) | Use Node's built-in test runner | Accepted |
| [0002](0002-hashed-session-tokens.md) | Store session tokens hashed, keyed by SECRET_KEY | Accepted |
| [0003](0003-per-section-authorization.md) | Authorize the staff portal per section | Accepted |
| [0004](0004-single-source-design-tokens.md) | One definition of colour, with a ratchet | Accepted |
| [0005](0005-zod-at-the-boundary.md) | Validate and sanitize at the boundary with zod | Accepted |
