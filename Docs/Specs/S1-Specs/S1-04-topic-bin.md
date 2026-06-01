# S1-04 — Topic Bin Assignment

Allows notes to be assigned to any topic node and queried by topic. This connects the flat note table to the file-bin hierarchy and is the primary organisational mechanism.

## Goals

- Note can be assigned to a topic at any depth (0, 1, or 2)
- GET /api/notes filtered by topic_id returns only notes in that topic
- Topic assignment updatable via PATCH /api/notes/:id

## Acceptance Criteria

- POST `/api/notes` with `topic_id` of a section (depth 2) creates note assigned to that section
- GET `/api/notes?topic_id=<id>` returns only notes with that exact `topic_id`
- PATCH `/api/notes/:id` with `{topic_id: null}` removes bin assignment
- PATCH `/api/notes/:id` with `{topic_id: "<new_id>"}` reassigns note to different topic
- GET `/api/notes?topic_id=<nonexistent>` returns empty array, not 404
- GET `/api/notes` without filter returns all notes regardless of topic

## Subtasks

- Add `topic_id` filter to `list_notes()` query function
- Confirm Drizzle FK constraint on `notes.topic_id` references `topics.id`
- Add `?topic_id=` query param handling to GET `/api/notes` route
- Update `UpdateNoteInput` schema to allow `topic_id: string | null`

## Avoid

Do not implement recursive/cascading topic queries (returning all notes in a topic AND its children) in this spec — keep it to exact topic_id match only. That can be added later.
