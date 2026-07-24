---
trigger: always_on
---

# Kura Code Style & Architecture Guidelines

IMPORTANT: Use a TDD approach to solving problems. *Do not assume* that your solution is correct. Instead, *validate your solution is correct* by first creating a test case and running the test case to _prove_ the solution is working as intended

This is your project, You are the project manager. Audit your own code. If something did not work find out why and avoid it next time
Always the take the time to understand what you are building 

If task is too big break it down to small actionable steps 

Create only necessary artifacts
Log, todo and plan those should be enough for everything and make sure you update them on every go

if trying to run a terminal command and it doesn't work for 3 times ask the user to type it in the terminal manually 

## Architecture Pattern (Repository-Service-Controller)
All backend logic must follow the valid 3-layer architecture:
1. **Repository** (`packages/core/.../repository.ts`): 
   - Direct Drizzle ORM calls (`db.select`, `db.insert`).
   - No business logic.
   - Raw data access only.
2. **Service** (`packages/core/.../service.ts`):
   - Wraps Repository methods.
   - Handles validation, sanitization, and business rules.
   - Can call multiple Repositories.
3. **Controller** (`apps/chamber/src/routes/.../+page.server.ts`):
   - SvelteKit load functions and Form Actions.
   - Calls Service methods.
   - Handles HTTP/FormData parsing and Response formatting.

## UI Design System
- **Theme**: "Linear-style" professional aesthetics (Zinc grayscale).
- **Colors**:
  - **NEVER** hardcode hex colors (e.g., `#000`).
  - Use `var(--zinc-50)` to `var(--zinc-950)` for neutrals.
  - Use `var(--brand-primary)` for main actions/accents.
  - Use `var(--brand-fg)` for text on brand background.
  - Use `var(--color-border)` for borders.
- **Components**: Prefer `@kura/ui` components over raw HTML.
- **CSS**: Use vanilla CSS with variables found in `tokens.css`.

## Data Handling
- **IDs**: Use UUIDs. New client-side IDs should use `new-` prefix if needed for logic distinctions.
- **Sanitization**: Sanitize user inputs (e.g., `Sanitizer.email()`) in the Service layer before storage.
- **Custom Fields**: Handle via `jsonb` columns as per Configuration module.

## General
- **Typescript**: Use strict typing. Interface inputs for Service methods.
- **Logging**: Use strict logging prefixes (e.g., `[EventSave]`, `[CrmImport]`).

## Coding Guidelines
- **SOLID Principles**: Follow Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion principles for maintainable and extensible code.
- **DRY (Don't Repeat Yourself)**: Avoid code duplication by extracting common logic into reusable functions, classes, or modules.
- **KISS (Keep It Simple, Stupid)**: Strive for simplicity in design and implementation. Avoid over-engineering.
- **Clean Code**: Write readable, self-documenting code with meaningful names, small functions, and clear structure.
- **Error Handling**: Implement robust error handling and logging to aid debugging and maintain reliability. Use low-cardinality logging with stable message strings e.g. `logger.info{id, foo}, 'Msg'`, `logger.error({error}, 'Another msg')`, etc
- **Performance**: Optimize for performance where necessary, but prioritize readability and maintainability

- Assume your world knowledge is out of date. Use your web search tool to find up-to-date docs and information.

- Do not add backwards compatibility unless specifically requested; update all downstream consumers




