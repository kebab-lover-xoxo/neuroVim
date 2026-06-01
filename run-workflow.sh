#!/usr/bin/env bash
set -euo pipefail

# Run this script from the repository root to install dependencies and build the workspace.
cd "$(dirname "${BASH_SOURCE[0]}")"

if ! command -v corepack >/dev/null 2>&1; then
  echo "Error: corepack is not installed. Install Node.js 20+ or enable corepack before running this script." >&2
  exit 1
fi

echo "Running workspace workflow from: $(pwd)"

echo "-> Enabling corepack"
corepack enable

echo "-> Installing workspace dependencies"
pnpm install

echo "-> Building workspace packages"
pnpm run build

echo "-> Running typecheck"
pnpm typecheck

echo "-> Running lint"
pnpm lint

echo "-> Running format check"
pnpm format:check

echo "Workspace workflow completed successfully."
