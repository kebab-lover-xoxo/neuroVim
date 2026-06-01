#!/bin/bash
set -e

echo "Cleaning up existing installations..."
rm -rf node_modules pnpm-lock.yaml

echo "Reinstalling all dependencies..."
pnpm install

echo "Building packages..."
pnpm build

echo "✓ Installation and build complete!"
