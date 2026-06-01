# S1-06 — Note Links

Creates labeled semantic relationships between note atoms, forming the Zettelkasten graph. Links are bidirectional by convention — querying either endpoint returns the connection.

## Goals

- Create labeled link between any two notes
- Query all links for a given note (both directions)
- Prevent self-links

## Acceptance Criteria

- POST `/api/notes/:id/links` with `{target_id, label: "extends"}` creates note_links row
- Self-link (source_id === target_id) returns 400
- Duplicate link (same source + target) returns 409
- GET `/api/notes/:id/links` returns all linked notes in both directions
- GET response includes `label` and `target` note object (id, title, category)
- Deleting source note cascades to note_links rows where source_id matches
- Deleting target note cascades to note_links rows where target_id matches
- DELETE `/api/notes/:id/links/:target_id` removes the link

## Subtasks

- Add `insert_note_link()`, `get_note_links()` in `packages/core/db/note-links.ts`
- `get_note_links()` queries both `source_id = ?` and `target_id = ?` (UNION)
- Add POST/GET/DELETE routes under `/api/notes/:id/links`
- Confirm cascade delete in Drizzle schema covers both source and target FK

## Avoid

Do not implement graph traversal (multi-hop link queries) in this spec — GET /api/notes/:id/links returns only direct neighbours. Do not enforce a controlled vocabulary on label — free text is fine for v1.
