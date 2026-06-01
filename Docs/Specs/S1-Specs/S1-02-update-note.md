# S1-02 — Update Note

Allows individual note fields to be updated independently without overwriting unrelated data. Partial updates are critical for the Feynman summary workflow where body and summary are edited separately.

## Goals

- PATCH /api/notes/:id accepts any subset of updatable fields
- Only provided fields are updated; others remain unchanged
- `updated_at` refreshes on every successful update

## Acceptance Criteria

- PATCH with `{summary: "plain language explanation"}` updates only `summary`; `body` unchanged
- PATCH with `{category: "complex"}` updates only `category`
- PATCH with `{title, body}` updates both; `summary` unchanged
- PATCH with invalid `category` returns 400
- PATCH with `topic_id` pointing to non-existent topic returns 400
- `updated_at` is newer than `created_at` after any successful PATCH
- PATCH on non-existent note id returns 404

## Subtasks

- Add `UpdateNoteInput` Zod schema (all fields optional)
- Add `update_note()` query function using Drizzle partial update
- Add PATCH `/api/notes/:id` Express route
- Return full updated note in response body

## Avoid

Do not allow `id`, `created_at` to be updated via this endpoint. Do not perform a full replace — only update fields explicitly provided in the request body.
