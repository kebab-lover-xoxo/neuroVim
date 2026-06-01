# S0-03 — Hot Reload

Enables Vite HMR inside the running Docker container so UI changes reflect in the browser without a container restart. This is a development-only concern and must not affect the production build path.

## Goals

- Vite dev server runs inside the container and proxies to Express API
- File changes in `packages/ui/src/` reflect in browser within 2 seconds
- HMR websocket connects successfully through the Docker port mapping
- Production build path (`vite build`) is unaffected

## Acceptance Criteria

- Editing any React component in `packages/ui/src/` updates the browser without a full reload
- Vite HMR websocket does not produce connection errors in the browser console
- `docker compose up` in dev mode starts both Express and Vite dev server as concurrent processes
- Killing and restarting the container re-establishes HMR without manual steps
- `NODE_ENV=production docker compose up` serves the static build, not the dev server

## Subtasks

- Add `vite.config.ts` with `server.host: true` and `server.port: 5173`
- Configure Vite `server.proxy` to forward `/api/*` to Express on port `3000`
- Update `docker-compose.yml` dev override to mount `packages/ui/src` as a volume
- Use `concurrently` or `docker compose` depends to run Vite + Express together
- Set `CHOKIDAR_USEPOLLING=true` env var in Docker (required for file watch in containers)

## Avoid

Do not use `nodemon` for Express hot reload at this stage — API routes are stubs and do not need to restart. Do not expose the Vite dev server port (5173) publicly; it should only be accessible via the Express proxy.
