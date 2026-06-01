# S1-07 — Feynman Summary Field

Separates the source note body from the user's own plain-language restatement. The summary field is the Feynman Technique in practice — it must be editable independently and visually distinct in the UI.

## Goals

- `summary` field updatable independently of `body`
- UI treats summary as a distinct editable region with a clear prompt
- Empty summary surfaces a nudge in the UI

## Acceptance Criteria

- PATCH `/api/notes/:id` with `{summary: "Heat flows from hot to cold because entropy increases"}` updates only `summary`; `body` unchanged
- PATCH with `{body: "updated body"}` does not clear existing `summary`
- GET `/api/notes/:id` returns both `body` and `summary` as separate fields
- `summary` can be set to `null` or empty string to clear it
- UI: summary renders in a visually distinct region below body
- UI: when summary is null or empty, shows "Explain this in your own words" prompt
- Prompt disappears once summary has content

## Subtasks

- Confirm `summary TEXT` column nullable in Drizzle schema
- `UpdateNoteInput` already includes optional `summary` from S1-02
- Add summary editor component in `packages/ui/archetypes/Notes/`
- Apply distinct background or border to differentiate summary from body region
- Conditional prompt using `!note.summary` boolean guard

## Avoid

Do not auto-generate summaries or pre-fill from body content — the manual restatement is the entire cognitive value of this field. Do not merge summary and body into a single text area.
