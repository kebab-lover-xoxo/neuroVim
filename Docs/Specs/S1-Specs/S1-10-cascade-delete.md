# S1-10 — Cascade Delete

Ensures referential integrity when a note is deleted. Orphaned note_tags, note_links, and any future child records must not accumulate in the database.

## Goals

- Deleting a note removes all associated note_tags rows
- Deleting a note removes all note_links rows where it appears as source or target
- DELETE endpoint returns appropriate status

## Acceptance Criteria

- DELETE `/api/notes/:id` returns 204 on success
- After delete: `SELECT * FROM note_tags WHERE note_id = ?` returns zero rows
- After delete: `SELECT * FROM note_links WHERE source_id = ? OR target_id = ?` returns zero rows
- DELETE on non-existent note id returns 404
- Deleting a note that is referenced as a chunk_atom does not cascade to sessions (chunk_atom note_id SET NULL per schema)
- `PRAGMA foreign_keys = ON` confirmed active on every connection

## Subtasks

- Add `delete_note()` in `packages/core/db/notes.ts`
- Add DELETE `/api/notes/:id` Express route
- Confirm Drizzle schema: `note_tags.note_id` ON DELETE CASCADE
- Confirm Drizzle schema: `note_links.source_id` ON DELETE CASCADE, `note_links.target_id` ON DELETE CASCADE
- Confirm `PRAGMA foreign_keys = ON` in DB connection initialisation
- Write integration test: create note → attach tag → link to another note → delete → verify no orphans

## Avoid

Do not soft-delete (is_deleted flag) — notes are deleted permanently. Do not delete cards or reviews when a note is deleted; cards are independent scheduling units and their history must be preserved for FSRS optimizer replay.
