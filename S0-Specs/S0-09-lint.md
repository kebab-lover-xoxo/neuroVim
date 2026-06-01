# S0-09 — Lint and Formatting

Enforces consistent code style across the monorepo using ESLint for correctness rules and Prettier for formatting. A clean lint baseline from Sprint 0 means all future code is held to the same standard without accumulating a backlog of style debt.

## Goals

- ESLint configured at repo root with rules applied to all packages
- Prettier configured with project style rules
- `pnpm lint` passes with zero errors across all packages
- `pnpm format:check` passes with zero violations
- CI runs both checks on every push

## Acceptance Criteria

- `pnpm lint` exits with code 0 across all packages
- `pnpm format:check` exits with code 0 (no unformatted files)
- ESLint config enables `@typescript-eslint/recommended` and `react-hooks/rules-of-hooks`
- Introducing an unused variable causes lint to fail (verified by test)
- Prettier config specifies: `singleQuote: true`, `semi: false`, `trailingComma: "es5"`, `printWidth: 100`
- `.eslintignore` and `.prettierignore` exclude `node_modules`, `dist`, `drizzle/migrations`

## Subtasks

- Install `eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-plugin-react-hooks`
- Write `.eslintrc.json` at repo root extending recommended configs
- Install `prettier` and `eslint-config-prettier`
- Write `.prettierrc` with project style rules
- Add `"lint": "eslint ."` and `"format:check": "prettier --check ."` to root `package.json`
- Add lint and format-check steps to CI workflow after type-check

## Avoid

Do not add opinionated rules beyond the recommended sets at this stage — rule additions should be deliberate decisions, not bulk imports. Do not configure auto-fix in CI; the check must fail visibly so the developer fixes it locally.
