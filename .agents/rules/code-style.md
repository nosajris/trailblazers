---
trigger: always_on
---

# Trailblazers Code Style & Architecture Guidelines

IMPORTANT: Use a TDD approach to solving problems. *Do not assume* that your solution is correct. Instead, *validate your solution is correct* by first creating a test case and running the test case to _prove_ the solution is working as intended

This is your project, You are the project manager. Audit your own code. If something did not work find out why and avoid it next time
Always the take the time to understand what you are building 

If task is too big break it down to small actionable steps 

Create only necessary artifacts
Log, todo and plan those should be enough for everything and make sure you update them on every go

if trying to run a terminal command and it doesn't work for 3 times ask the user to type it in the terminal manually 

## Architecture Pattern (Repository-Service-Controller)
All backend logic must follow the valid 3-layer architecture:
1. **Repository** (`packages/core/src/modules/<domain>/repository.ts`):
   - Direct Drizzle ORM calls (`db.select`, `db.insert`).
   - No business logic.
   - Raw data access only.
2. **Service** (`packages/core/src/modules/<domain>/service.ts`):
   - Wraps Repository methods.
   - Handles validation, sanitization, and business rules.
   - Can call multiple Repositories.
3. **Controller** (`apps/{web,admin}/src/routes/**/+page.server.ts`):
   - SvelteKit load functions and Form Actions.
   - Calls Service methods.
   - Handles HTTP/FormData parsing and Response formatting.

**The reference implementation is the `events` module** — `repository.ts`,
`validation.ts`, `service.ts`, and `apps/admin/src/routes/events/+page.server.ts`.
Copy that shape. Most other modules predate it and still call Drizzle from the
service; convert the one you are working in rather than adding to the pile.

## Input validation
- **Every form input is validated with a zod schema**, declared in the module's
  `validation.ts` and applied by `handleAction` in
  `apps/admin/src/lib/server/actions.ts`. Do not hand-parse `FormData` in a
  controller.
- Sanitization (`Sanitizer.text`, `.email`, `.phone`) is built into the shared
  field helpers in `packages/core/src/util/form.ts`, so it applies at the
  boundary automatically. Use those helpers rather than raw `z.string()`.
- Use `optionalUrl()` for anything rendered into `href` or `src`: it rejects
  `javascript:` and `data:`, which plain `z.string().url()` accepts.

## UI Design System
- **Theme**: "Linear-style" professional aesthetics (Zinc grayscale).
- **Colors**:
  - **NEVER** hardcode hex colors (e.g., `#000`).
  - Use `var(--zinc-50)` to `var(--zinc-950)` for neutrals.
  - Use `var(--brand-primary)` for main actions/accents.
  - Use `var(--brand-fg)` for text on brand background.
  - Use `var(--color-border)` for borders.
- **Components**: Prefer `@trailblazers/ui` components over raw HTML.
- **CSS**: Use vanilla CSS with the variables in `packages/ui/src/tokens.css`,
  which is the single definition of colour and is imported by both apps.
  A colour has a hex form (`--brand-primary`) for hand-written CSS and a
  channel form (`--brand-primary-rgb`) that the Tailwind configs read so
  opacity modifiers keep working. **Change both or neither** —
  `packages/ui/src/tokens.test.ts` fails if they disagree, and also ratchets
  the count of hardcoded hex colours downward. If that count test fails,
  replace the literal with a token; never raise the limit.

## Data Handling & Database Migrations
- **IDs**: Use UUIDs. New client-side IDs should use `new-` prefix if needed for logic distinctions.
- **Sanitization**: Sanitize user inputs (e.g., `Sanitizer.email()`) in the Service layer before storage.
- **Custom Fields**: Handle via `jsonb` columns as per Configuration module.
- **Database Migration Policy**: **NEVER** use `drizzle-kit push` or `npm run db:push`. **ALWAYS** use the official migration workflow:
  1. `npm run db:generate` to generate tracked SQL migration files in `drizzle/`.
  2. `npm run db:migrate` to execute generated migrations cleanly on the database.

## General
- **Typescript**: Use strict typing. Interface inputs for Service methods.
- **Logging**: Use `logger` from `@trailblazers/core`. Its real signature is
  `logger.info(module, message, details?)` — e.g.
  `logger.info('EventSave', 'saved', { id })`.

## Commits
- **Reference the issue** in the subject line, as a trailing `(#N)`:
  `fix(events): save the banner uploaded during initial event creation (#198)`.
  GitHub then links the commit on the issue and it shows up in the PR.
- **Never use a closing keyword** — `fixes #N`, `closes #N`, `resolves #N` (and
  their variants) auto-close the issue when the PR merges. That skips the
  `need testing` verification step this team relies on, so an unverified fix
  would silently disappear from the board. A bare `(#N)` links without closing.
  Note `fix(scope):` is safe — the keyword only triggers when it directly
  precedes the reference, as in `fixes #198`.
- **No issue yet?** File one first if the work is user-visible, so it can be
  tracked and verified — see the `issue-tracking` skill. Chores and internal
  refactors do not need one.
- In the body, say **why** the change is needed and what was verified, not just
  what changed. State the root cause when fixing a bug.

## Coding Guidelines
- **SOLID Principles**: Follow Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion principles for maintainable and extensible code.
- **DRY (Don't Repeat Yourself)**: Avoid code duplication by extracting common logic into reusable functions, classes, or modules.
- **KISS (Keep It Simple, Stupid)**: Strive for simplicity in design and implementation. Avoid over-engineering.
- **Clean Code**: Write readable, self-documenting code with meaningful names, small functions, and clear structure.
- **Error Handling**: Implement robust error handling and logging to aid debugging and maintain reliability. Keep the module tag and message low-cardinality and put the varying values in `details`: `logger.info('EventSave', 'saved', { id })`, `logger.error('EventSave', 'failed', { message })`. Never render an internal error to the browser — log it and return a generic message.
- **Performance**: Optimize for performance where necessary, but prioritize readability and maintainability

- Assume your world knowledge is out of date. Use your web search tool to find up-to-date docs and information.

- Do not add backwards compatibility unless specifically requested; update all downstream consumers




