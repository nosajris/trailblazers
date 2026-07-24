---
trigger: always_on
---

# Feature Development Workflow

This document outlines the standard workflow for implementing new features in the Kura platform.

## Overview

We follow a **TDD-first, Plan-Execute-Verify** approach with comprehensive E2E testing to ensure stability and maintainability.

## Workflow Phases

### Phase 1: Planning

1. **Create `task.md`** in the artifacts directory
   - Break down the feature into component-level tasks
   - Use checkboxes: `[ ]` uncompleted, `[/]` in progress, `[x]` completed
   - Organize by logical groupings (Backend, Frontend, Testing)

2. **Create `implementation_plan.md`** in the artifacts directory
   - Document technical approach and architecture decisions
   - List all files to be created/modified, grouped by component
   - Include verification plan (automated tests + manual checks)
   - Use format:
     ```markdown
     # [Feature Name]
     
     ## User Review Required
     - Breaking changes or design decisions
     
     ## Proposed Changes
     ### [Component Name]
     #### [MODIFY] [file.ts](file:///path/to/file.ts)
     #### [NEW] [file.ts](file:///path/to/file.ts)
     
     ## Verification Plan
     - Automated tests
     - Manual verification steps
     ```

3. **Request user approval** via `notify_user` with `BlockedOnUser: true`
   - Include paths to `implementation_plan.md`
   - Wait for user feedback before proceeding

### Phase 2: Execution

4. **Follow 3-Tier Architecture** (Repository → Service → Controller)
   - **Repository**: Raw database access (Drizzle ORM)
   - **Service**: Business logic, validation, sanitization
   - **Controller**: SvelteKit routes, form actions, HTTP handling

5. **Implement Backend First**
   - Create/update repository methods
   - Create/update service methods with validation
   - Create/update server-side routes and actions
   - Add proper error handling and logging

6. **Implement Frontend**
   - Create/update Svelte components
   - Use `@kura/ui` components for consistency
   - Follow design system (Linear-style, Zinc colors)
   - Use vanilla CSS with CSS variables

7. **Update `task.md`** as you progress
   - Mark items as `[/]` when starting
   - Mark items as `[x]` when completed

### Phase 3: Verification

8. **Create Playwright E2E Tests**
   - Create `tests/[feature-name].spec.ts`
   - Test all user flows and edge cases
   - Use descriptive test names
   - Include setup/teardown as needed
   - Example structure:
     ```typescript
     test.describe('Feature Name', () => {
         test.beforeEach(async ({ page }) => {
             await page.goto('/feature-path');
             await page.waitForLoadState('networkidle');
         });
         
         test('Happy path flow', async ({ page }) => {
             // Test implementation
         });
         
         test('Edge case handling', async ({ page }) => {
             // Test implementation
         });
     });
     ```

9. **Run Tests and Fix Issues**
   - Execute: `npx playwright test tests/[feature-name].spec.ts`
   - Debug failures with increased timeouts, better selectors
   - Ensure 100% pass rate before completion

10. **Create `walkthrough.md`** in the artifacts directory
    - Document what was accomplished
    - Include test results and verification proof
    - Embed screenshots/recordings if relevant
    - Use format:
      ```markdown
      # [Feature Name] Walkthrough
      
      ## Key Accomplishments
      - Feature 1
      - Feature 2
      
      ## Verification Results
      | Test Case | Status | Detail |
      |-----------|--------|--------|
      | Test 1    | ✅ Pass | Description |
      
      ## Proof of Work
      ![Screenshot](file:///path/to/screenshot.png)
      ```

### Phase 4: Completion

11. **Final Checklist**
    - [ ] All `task.md` items marked `[x]`
    - [ ] E2E tests passing at 100%
    - [ ] `walkthrough.md` created with proof of work
    - [ ] Code follows architecture patterns
    - [ ] No lint errors
    - [ ] User-facing changes documented

12. **Notify user** via `notify_user` with completion summary
    - Include paths to `walkthrough.md`
    - Highlight key accomplishments
    - Note any follow-up items

## Testing Best Practices

### E2E Test Stability
- Use explicit waits: `await page.locator('.element').waitFor({ state: 'visible', timeout: 10000 })`
- Avoid `waitForTimeout` unless absolutely necessary
- Use specific selectors (classes, data attributes, roles)
- Add `force: true` for checkbox interactions if needed
- Test in isolation first, then in full suite

### Test Data Management
- Use timestamps for unique test data: `Test-${Date.now()}`
- Clean up test data in `afterEach` if needed
- Use shared auth state (`.auth/user.json`) for faster tests

### Common Patterns
- **Sheet/Modal opening**: Wait for `.sheet-panel` visibility
- **Form submission**: Use `page.getByRole('button', { name: /Submit/i })`
- **Navigation**: Use `page.waitForURL(/pattern/)`
- **Search/Filter**: Use debounced waits after input

## Artifact Management

### Required Artifacts
- `task.md` - Task breakdown and progress tracking
- `implementation_plan.md` - Technical plan (for complex features)
- `walkthrough.md` - Completion summary and proof of work

### Optional Artifacts
- `[feature]-plan.md` - Detailed feature specifications
- `ux-gap-analysis.md` - UX improvement documentation

### Artifact Guidelines
- Keep artifacts **concise** and **scannable**
- Use markdown tables, lists, and alerts
- Link to code with `[file.ts](file:///absolute/path)`
- Embed media with `![caption](file:///absolute/path)`
- Update continuously as work progresses

## Example: Recent Global Search Implementation

1. ✅ Created `global-search-plan.md` with detailed component specs
2. ✅ Requested user approval → Approved
3. ✅ Implemented `GlobalSearch.svelte` component
4. ✅ Implemented `/api/search` endpoint
5. ✅ Integrated into `+layout.svelte`
6. ✅ Created `tests/global-search.spec.ts`
7. ⏳ Running E2E verification (debugging auth setup)
8. ⏳ Will create `walkthrough.md` upon completion

## Key Principles

- **TDD First**: Write tests before or alongside implementation
- **Incremental Progress**: Small, verifiable steps
- **Continuous Verification**: Test early and often
- **Documentation**: Keep artifacts updated in real-time
- **User Communication**: Use `notify_user` for approvals and completions
