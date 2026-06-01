# S0-08 — TypeScript Type-Check

Establishes a zero-error TypeScript baseline across all packages so type safety is enforced from the first commit. Every subsequent sprint must maintain this baseline — a sprint cannot be closed if `tsc --noEmit` fails anywhere in the workspace.

## Goals

- Root `tsconfig.base.json` defines shared compiler options used by all packages
- Each package extends `tsconfig.base.json` with package-specific overrides
- `tsc --noEmit` passes with zero errors in `packages/core`, `packages/ui`, `apps/web`
- `strict: true` enabled in base config

## Acceptance Criteria

- `pnpm --filter @mnemo/core tsc --noEmit` exits with code 0
- `pnpm --filter @mnemo/ui tsc --noEmit` exits with code 0
- `pnpm --filter @mnemo/web tsc --noEmit` exits with code 0
- `strict: true` confirmed in `tsconfig.base.json` (enables `noImplicitAny`, `strictNullChecks`, etc.)
- Introducing a type error in any package causes the check to fail (verified by temporarily breaking a type and confirming non-zero exit)
- CI workflow runs type-check step and fails the build on error

## Subtasks

- Write `tsconfig.base.json` at repo root: `target: ES2022`, `module: NodeNext`, `strict: true`, `skipLibCheck: true`
- Write `tsconfig.json` in each package extending base with correct `rootDir` and `outDir`
- Add `"typecheck": "tsc --noEmit"` script to each `package.json`
- Add `"typecheck": "pnpm -r typecheck"` to root `package.json`
- Configure CI step: `pnpm typecheck` must pass before any other CI steps

## Avoid

Do not use `// @ts-ignore` or `// @ts-nocheck` anywhere in the codebase — all type errors must be resolved properly. Do not set `strict: false` as a workaround; fix the types instead.
