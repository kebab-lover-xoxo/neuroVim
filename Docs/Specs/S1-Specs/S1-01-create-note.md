# S1-01 — Create Note

Creates the foundational note atom — the core unit of the Zettelkasten system. Every other Notes archetype feature depends on this working correctly first.

## Goals

- POST /api/notes accepts title, body, category, and optional topic_id
- Returns created note with generated nanoid and timestamps
- note inserted to DB with correct defaults

## Acceptance Criteria

- POST /api/notes with `{title, body, category: "vocab"}` returns 201 with note record
- Returned note includes `id` (nanoid), `created_at`, `updated_at`
- `category` outside `(vocab|thinking|complex)` returns 400
- Missing `title` or `body` returns 400
- `topic_id` provided but not found in topics table returns 400
- `topic_id` omitted defaults to NULL (no bin assignment)
- GET /api/notes/:id returns the created note

## Subtasks

- Add `CreateNoteInput` Zod schema in `packages/core/types.ts`
- Add `insert_note()` query function in `packages/core/db/notes.ts`
- Add POST `/api/notes` Express route in `apps/web/routes/notes.ts`
- Validate input against schema before DB insert
- Return 400 with field-level error message on validation failure

## Avoid

Do not add summary, tags, or links in this spec — those are separate specs. Do not allow category to default silently if invalid; always return an explicit 400.
