Project single source-of-truth
===============================

This repository now uses the workspace root as the single source of truth for shared developer tooling and TypeScript settings.

What is centralized
- Root `package.json` holds shared devDependencies (ESLint, TypeScript, type packages, build tools).
- Root `tsconfig.json` provides common TypeScript compilerOptions (including `types: ["node"]`).

What changed
- Per-package `package.json` files no longer repeat shared `@types/*` devDependencies. Keep package-specific devDependencies (native bindings, package-specific types) in the package manifest.
- `packages/core/src/db.ts` now imports Node's `path` module to avoid TypeScript resolution errors.

How to use
1. Install workspace dependencies (from repo root):

```bash
pnpm install
```

2. If native modules fail to build (e.g., `better-sqlite3`), install system packages on Debian/Ubuntu:

```bash
sudo apt-get update
sudo apt-get install -y python3 make g++ libsqlite3-dev pkg-config
npm_config_build_from_source=true pnpm install
```

3. Typecheck all packages:

```bash
pnpm -r run typecheck
```

Notes
- Keep shared config in the root (tsconfig, ESLint, Prettier, CI). Package-level overrides can use `extends` to reference root configs.
- If you add new shared tooling or types, add them to the root `devDependencies` and remove duplicates from package manifests.
