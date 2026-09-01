# 0001. Use Node's built-in test runner

Status: Accepted
Date: 2026-09-01

## Context

The repository had no unit test runner. No vitest, no `npm test`, no test
script of any kind. Every service in `packages/core` — that is, every business
rule in the product — was unverified, and the only automated checks were
typecheck and build.

The obvious move was to add vitest, which the reference project in
`architecture_example/` uses. That means a dependency, a config file, and a
second module-resolution system to keep aligned with SvelteKit's.

Node 22.18+ can execute TypeScript directly via type stripping, and ships a
test runner in core.

## Decision

Use `node --test` with Node's built-in type stripping. No test framework
dependency, no build step, no config file.

The one obstacle is that this codebase writes relative imports with a `.js`
extension (the TypeScript convention), which Node does not resolve to `.ts`.
`scripts/ts-resolve-hook.mjs` closes that gap: when a relative `.js` specifier
does not exist on disk but the sibling `.ts` does, it resolves to the `.ts`.
It only redirects when the `.js` is genuinely absent, so real JavaScript is
untouched.

Services are tested against a small hand-rolled fake `Database` rather than a
real Postgres — see `packages/core/src/modules/inquiries/service.test.ts`.

## Consequences

- Requires Node 22.18 or newer. `package.json` declares it in `engines` and CI
  pins Node 22. **Lowering the CI Node version breaks the test suite.**
- Tests must be run through `npm test`, not bare `node --test`, or the resolver
  hook is not registered.
- No `describe`/`it` nesting sugar, no built-in mocking library, no snapshot
  testing. `node:test` and `node:assert/strict` only.
- If the suite ever needs jsdom, component rendering, or coverage thresholds,
  revisit this. Those are the conditions that would justify vitest.
