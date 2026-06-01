# S1-05 — Tags

Implements the flat semantic tag namespace. Tags are user-defined labels applied to notes for cross-topic retrieval — the complement to the hierarchical topic bin system.

## Goals

- Create tags, attach to notes, detach from notes, filter notes by tag
- Tags are global (not scoped to topic or note)
- note_tags join table manages many-to-many relationship

## Acceptance Criteria

- POST `/api/tags` with `{name: "thermo", color: "#0175f0"}` creates tag
- POST `/api/tags` with duplicate name returns 409
- POST `/api/notes/:id/tags` with `{tag_id}` attaches tag to note
- Attaching same tag twice returns 409 (not duplicate row)
- DELETE `/api/notes/:id/tags/:tag_id` removes tag from note
- GET `/api/notes?tag=thermo` returns notes with that tag
- GET `/api/tags` returns all tags
- Deleting a note cascades to note_tags (no orphan rows)

## Subtasks

- Add `insert_tag()`, `list_tags()` in `packages/core/db/tags.ts`
- Add `attach_tag()`, `detach_tag()` in `packages/core/db/note-tags.ts`
- Add `tag` filter to `list_notes()` query (JOIN note_tags)
- Add GET/POST `/api/tags` routes
- Add POST/DELETE `/api/notes/:id/tags/:tag_id` routes

## Avoid

Do not implement tag renaming or deletion in this spec. Do not allow tag names with special characters — validate to alphanumeric + hyphens only.
