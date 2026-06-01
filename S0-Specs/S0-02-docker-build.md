# S0-02 — Docker Build

Produces a working Docker image that builds the full monorepo and serves the app on a single exposed port. The image must build cleanly from a cold clone with no manual steps beyond `docker compose up`.

## Goals

- Multi-stage `Dockerfile`: stage 1 builds `packages/ui` static assets, stage 2 runs Express
- `docker-compose.yml` defines the `mnemo` service with port mapping and volume mount
- `.dockerignore` excludes `node_modules`, `.git`, `data/`
- Build completes without error on a clean Docker environment

## Acceptance Criteria

- `docker compose up --build` completes without error from a clean repo clone
- App is reachable at `http://localhost:3000` after container starts
- `docker image ls mnemo` shows image size under 400 MB (pre-optimisation baseline)
- Container logs show Express listening on correct port
- Stopping the container with `Ctrl+C` exits cleanly within 3 seconds
- Re-running `docker compose up` (no `--build`) starts in under 10 seconds from cached layers

## Subtasks

- Write multi-stage `Dockerfile`: `FROM node:20-alpine AS builder`, copy workspace files, `pnpm install --frozen-lockfile`, `pnpm --filter @mnemo/ui build`
- Second stage: `FROM node:20-alpine`, copy Express server + built UI assets, `EXPOSE 3000`, `CMD ["node", "server/index.js"]`
- Write `docker-compose.yml`: service `mnemo`, `build: .`, `ports: ["3000:3000"]`, `volumes: ["./data:/data"]`
- Write `.dockerignore`
- Add `server/index.js` Express entry point that serves static files from `public/`

## Avoid

Do not configure production optimisations (non-root user, memory limits, healthcheck) in this spec — those belong to S7. Do not bind to `127.0.0.1` yet; that is also S7.
