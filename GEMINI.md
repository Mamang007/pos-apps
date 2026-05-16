# POS Apps - Project Guidelines

## Development Workflow (GitHub Issues Traceability)

To ensure strict traceability, every code change must be tied to a specific GitHub Issue.

- **1. Issue Creation**: Before writing any code, ensure a GitHub Issue exists describing the task (Feature, Bug, or Chore).
- **2. Branching**: Create a branch derived from the issue number and type.
  - Format: `<type>/<issue-number>-<short-desc>` (e.g., `feat/12-add-product-catalog`, `fix/34-cart-calculation`).
  - **Never commit directly to `main`.**
- **3. Documentation Review**: Before writing any code, read the latest updates in `docs/PRD.md` and `docs/TDD.md` related to the issue. The documentation is the "source of truth" and is updated before the issue is created.
- **4. Commit Messages**: Follow conventional commits and always reference the issue number.
  - Format: `<type>(<scope>): <description> (#<issue-number>)`
  - Example: `feat(catalog): add SKU validation (#12)`
- **4. Pull Requests**: Every PR must link to its corresponding issue using closing keywords in the PR description (e.g., `Closes #12` or `Fixes #34`) so that merging the PR automatically closes the issue.

## Technical Standards

- **Framework**: Next.js 15+ (App Router).
- **State Management**: Zustand with persistence middleware.
- **Database**: PostgreSQL (via Supabase) with Drizzle ORM (Flexible: Use `DATABASE_URL` for Supabase or standard Postgres).
- **Authentication**: Custom JWT-based Role-Based Access Control (RBAC).
- **PWA**: next-pwa for service worker management and manifest configuration.
- **Styling**: Tailwind CSS (prefer standard utility classes).
- **Testing**: Vitest for unit tests, Playwright for E2E.

## Folder Structure (Feature-Based Architecture)

Organize code by feature to keep related logic together:

- `src/features/`: Main feature modules (e.g., `src/features/master-data-barang`).
  - `[feature]/components/`: Feature-specific UI.
  - `[feature]/hooks/`: Feature-specific hooks.
  - `[feature]/services/`: API calls, server actions, and business logic.
  - `[feature]/types/`: TypeScript definitions for the feature.
- `src/components/ui/`: Shared atomic/reusable components.
- `src/lib/`: Shared utilities and client initializations (Drizzle, Supabase).
- `src/hooks/`: Shared global hooks.

## Code Convention

- **Components**: Use functional components with arrow functions and named exports.
- **Types**: Use `interface` for object shapes and `type` for unions/aliases. Avoid `any`.
- **Validation**: Use Zod for schema validation (forms and API).
- **Naming**: `kebab-case` for files/folders, `PascalCase` for components, `camelCase` for functions/variables.
- **Database**: Use Drizzle ORM for all database interactions.

## DO NOT RULES

- **DO NOT** use `any` type casts or `@ts-ignore` unless absolutely unavoidable.
- **DO NOT** use inline styles; always use Tailwind CSS.
- **DO NOT** create "Mega Components"; break down into smaller, focused components.
- **DO NOT** commit `.env` files or hardcode sensitive credentials.
- **DO NOT** use `useEffect` if the same result can be achieved with derived state or Server Components.

## Reference Documents

- [Product Requirements Document (PRD)](./docs/PRD.md)
- [Technical Design Document (TDD)](./docs/TDD.md)
