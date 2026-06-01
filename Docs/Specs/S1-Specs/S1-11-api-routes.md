# S1-11 — Notes API Route Completeness

Verifies the full Notes archetype API surface is present, consistent, and follows the established patterns from S1-01 through S1-10. This is the integration check before moving to Sprint 2.

## Goals

- All Notes routes documented, tested, and returning consistent response shapes
- Error responses consistent across all routes (status code, message format)
- No route returns 500 for expected invalid input

## Acceptance Criteria

- GET `/api/notes` — list with filter support: ?topic_id, ?tag, ?category
- POST `/api/notes` — create; 201 on success, 400 on validation failure
- GET `/api/notes/:id` — single note with tags, topic, and links
- PATCH `/api/notes/:id` — partial update; 200 on success, 400/404 on failure
- DELETE `/api/notes/:id` — 204 on success, 404 if not found
- GET `/api/topics` — full recursive tree
- POST `/api/topics` — create node; 400 on depth violation
- GET `/api/tags` — list all tags
- POST `/api/tags` — create; 409 on duplicate
- POST `/api/notes/:id/tags` — attach tag; 409 on duplicate
- DELETE `/api/notes/:id/tags/:tag_id` — detach tag; 404 if not attached
- GET `/api/notes/:id/links` — bidirectional neighbours
- POST `/api/notes/:id/links` — create link; 400 on self-link, 409 on duplicate
- DELETE `/api/notes/:id/links/:target_id` — remove link; 404 if not found
- All error responses: `{ error: string, field?: string }`

## Subtasks

- Write route index in `apps/web/routes/notes.ts` registering all routes
- Confirm each route calls a corresponding `packages/core` function (no inline DB logic in routes)
- Add 404 handler middleware for unknown route patterns
- Manual smoke-test all 14 routes with valid and invalid inputs

## Avoid

Do not add pagination yet — list endpoints return all records for v1. Do not add authentication middleware — that is a multi-user concern only.
