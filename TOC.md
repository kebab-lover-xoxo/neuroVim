> # Root Configuration & Tooling
> 
> ## `package.json`
> Monorepo manifest defining workspace packages, shared dev dependencies (ESLint, Prettier, TypeScript), and workspace scripts for build, typecheck, lint, and format operations.
> 
> ## `pnpm-workspace.yaml`
> Declares `packages/*` and `apps/*` as workspace members with hoisted node_modules and single pnpm-lock.yaml.
> 
> ## `pnpm-lock.yaml`
> Single locked dependency tree for the entire workspace; ensures reproducible installs across all environments.
> 
> ## `tsconfig.base.json`
> Shared TypeScript configuration with `strict: true`, `moduleResolution: nodenext`, and modern ES module targets.
> 
> ## `.eslintrc.json`
> ESLint ruleset extending `@typescript-eslint/recommended` and `react-hooks/rules-of-hooks` with Prettier integration.
> 
> ## `.eslintignore`
> Excludes `node_modules`, `dist`, and `drizzle/migrations` from linting.
> 
> ## `.prettierrc`
> Code formatter config: singleQuote, no semicolons, 100 char line width, trailing commas in ES5 mode.
> 
> ## `.prettierignore`
> Excludes `node_modules`, `dist`, migrations, lock files from Prettier formatting.
> 
> ## `.gitignore`
> Excludes build artifacts, environment files, SQLite database files, and node_modules.
> 
> ## `.dockerignore`
> Excludes `node_modules`, `.git`, and `data/` from Docker build context to minimize image size.
> 
> # Docker & Deployment
> 
> ## `Dockerfile`
> Multi-stage build: builder stage compiles all packages, runner stage serves static UI and API on port 3000.
> 
> ## `docker-compose.yml`
> Production service with port 3000 mapping and persistent `/data` volume mount for database.
> 
> ## `docker-compose.override.yml`
> Development override enabling Vite HMR, file watching, and source code volume mounts for live reload.
> 
> # Database & ORM
> 
> ## `drizzle.config.ts`
> Drizzle ORM configuration pointing to schema, migrations folder, and SQLite connection credentials.
> 
> ## `drizzle/schema.ts`
> Canonical v3 SQLite schema with 12 tables, foreign keys, CHECK constraints, and indexes.
> 
> ## `drizzle/migrations/0001_create_schema.sql`
> Initial schema creation migration: defines all tables with proper data types and constraints.
> 
> ## `drizzle/migrations/0002_fsrs_seed.sql`
> Idempotent seed migration inserting FSRS-5 default weights into fsrs_params table.
> 
> ## `drizzle/.gitignore`
> Excludes `node_modules` and build artifacts from the migrations directory.
> 
> # Application Server
> 
> ## `server/index.js`
> Express entrypoint that mounts the API, proxies Vite in dev mode, and serves static assets in production.
> 
> ## `server/.gitignore`
> (Empty placeholder ensuring directory presence in version control)
> 
> # Packages
> 
> ## `packages/core/package.json`
> Core library manifest declaring `better-sqlite3` and `drizzle-orm` dependencies for database access.
> 
> ## `packages/core/tsconfig.json`
> Core-specific TypeScript config: CommonJS output, declaration generation, Node types.
> 
> ## `packages/core/src/db.ts`
> SQLite connection factory with WAL mode, synchronous pragma, foreign key enforcement, and startup logging.
> 
> ## `packages/core/src/init.ts`
> Database initialization runner that executes Drizzle migrations and validates FSRS parameter seeding.
> 
> ## `packages/core/src/index.ts`
> Public core exports: `getWelcomeMessage()`, `setupCore()`, and `CoreStatus` type.
> 
> ## `packages/core/.gitignore`
> Excludes `node_modules`, `dist`, build artifacts, and environment files.
> 
> ## `packages/ui/package.json`
> React UI library with Vite, React Router, and workspace references to `@mnemo/core`.
> 
> ## `packages/ui/tsconfig.json`
> UI-specific TypeScript config: ESNext modules, React JSX preservation, Vite client types.
> 
> ## `packages/ui/vite.config.ts`
> Vite configuration with host binding for HMR and `/api` proxy to Express backend.
> 
> ## `packages/ui/index.html`
> HTML entry point mounting the React app into the DOM.
> 
> ## `packages/ui/src/main.tsx`
> React entrypoint rendering the App component to the root DOM element.
> 
> ## `packages/ui/src/App.tsx`
> React Router host with navigation links and routes for `/notes`, `/working`, `/recall`, and 404 fallback.
> 
> ## `packages/ui/src/index.css`
> Base styling for the application shell, dark theme, navigation, and route layouts.
> 
> ## `packages/ui/src/pages/notes-page.tsx`
> Notes archetype placeholder component.
> 
> ## `packages/ui/src/pages/working-page.tsx`
> Working archetype placeholder component.
> 
> ## `packages/ui/src/pages/recall-page.tsx`
> Recall archetype placeholder component.
> 
> ## `packages/ui/src/pages/not-found-page.tsx`
> 404 error page for unmatched routes.
> 
> ## `packages/ui/.gitignore`
> Excludes `node_modules`, `dist`, build artifacts, environment files, and coverage.
> 
> ## `apps/web/package.json`
> Express server manifest with workspace references to `@mnemo/core` and `@mnemo/ui`, plus `@types/express` dev dependency.
> 
> ## `apps/web/tsconfig.json`
> Web-specific TypeScript config: CommonJS output, esModuleInterop, Node types.
> 
> ## `apps/web/src/index.ts`
> Express app factory with middleware setup, database initialization, and `/health` and `/info` API endpoints.
> 
> ## `apps/web/.gitignore`
> Excludes `node_modules`, `dist`, build artifacts, environment files, and coverage reports.
> 
> # Data & State
> 
> ## `data/`
> Runtime directory for SQLite database files and future media assets. Mounted as `/data/` in Docker.
> 
> ## `data/.gitkeep`
> Placeholder ensuring `data/` directory is tracked in version control while contents are ignored.
> 
> # CI/CD Workflows
> 
> ## `.github/workflows/typecheck.yml`
> GitHub Actions workflow running `pnpm typecheck` on every push and PR to main/S0-Specs branches.
> 
> ## `.github/workflows/lint.yml`
> GitHub Actions workflow running `pnpm lint` and `pnpm format:check` to enforce code style.
> 
> ## `.github/workflows/build.yml`
> GitHub Actions workflow building all packages to verify compilation.
> 
> ## `.github/workflows/docker.yml`
> GitHub Actions workflow building the Docker image and caching build layers via GitHub Container Registry.
