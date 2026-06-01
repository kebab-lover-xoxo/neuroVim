# S0-01 — Workspace Initialisation

Establishes the pnpm monorepo so every package can resolve shared dependencies through a single lockfile and hoisted node_modules. This is the first thing that must work before any other tooling can run.

## Goals

- `pnpm-workspace.yaml` declares `packages/*` and `apps/*`
- `packages/core` contains TypeScript source with no framework dependencies
- `packages/ui` contains Vite + React config referencing `core` via workspace protocol
- `apps/web` contains Express server referencing both `core` and `ui` via workspace protocol
- Single `pnpm-lock.yaml` at repo root; no nested lockfiles

## Acceptance Criteria

- `pnpm install` from repo root completes with zero errors
- `packages/core`, `packages/ui`, `apps/web` each resolve their workspace deps without `node_modules` duplication
- `import` from `@mnemo/core` resolves correctly inside `packages/ui` and `apps/web`
- Removing `node_modules` and re-running `pnpm install` produces identical resolution
- `pnpm --filter @mnemo/core build` compiles TypeScript without error

## Subtasks

- Create `pnpm-workspace.yaml`
- Scaffold `packages/core/package.json` with name `@mnemo/core`, `exports` field, `tsconfig.json`
- Scaffold `packages/ui/package.json` with name `@mnemo/ui`, Vite + React deps, workspace ref to `@mnemo/core`
- Scaffold `apps/web/package.json` with Express dep, workspace refs to both packages
- Add root `tsconfig.base.json` with shared compiler options; extend in each package

## Avoid

Do not add application logic or UI components to any package at this stage — package contents should be empty entry points only. Do not configure path aliases until `tsconfig` base is confirmed working.
