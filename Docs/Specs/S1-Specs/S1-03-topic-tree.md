# S1-03 — Topic Tree

Implements the file-bin hierarchy that organises notes into Topic → Chapter → Section structure. Depth enforcement is a hard constraint, not a UI convention.

## Goals

- POST /api/topics creates a topic node at the correct depth
- GET /api/topics returns the full recursive tree
- depth constraint (0–2) enforced at DB and application layer

## Acceptance Criteria

- POST `/api/topics` with `{name: "Thermodynamics", depth: 0}` creates root topic
- POST with `{name: "Heat Transfer", parent_id: "<topic_id>", depth: 1}` creates chapter
- POST with `depth: 3` returns 400 — rejected before DB insert
- POST with `parent_id` pointing to non-existent topic returns 400
- GET `/api/topics` returns nested tree: `{id, name, depth, children: [...]}`
- Slug auto-generated from name (kebab-case), unique within siblings
- Duplicate slug within same parent returns 409

## Subtasks

- Add `CreateTopicInput` Zod schema with depth CHECK
- Add `insert_topic()` and `get_topic_tree()` functions in `packages/core/db/topics.ts`
- `get_topic_tree()` uses recursive CTE or iterative assembly in app layer
- Add GET and POST `/api/topics` Express routes
- Slug generation: `name.toLowerCase().replace(/\s+/g, '-')`

## Avoid

Do not allow more than 3 levels (depth 0, 1, 2). Do not build topic deletion in this spec — cascade implications need careful handling and belong in a later cleanup pass.
