# S1-08 — Category Enum Enforcement

Ensures the three-tier cognitive complexity classification (vocab / thinking / complex) is enforced at every layer — DB, API, and UI. This classification drives future features including card creation defaults and FSRS initial stability.

## Goals

- category constrained to exactly (vocab, thinking, complex) at DB and API
- Category badge visible on every note in browser
- Category selectable at note creation and update

## Acceptance Criteria

- DB CHECK constraint rejects any value outside the enum (confirmed via direct SQL insert attempt)
- POST `/api/notes` with `category: "concept"` returns 400 before reaching DB
- PATCH `/api/notes/:id` with invalid category returns 400
- GET `/api/notes` list returns `category` field on every note
- UI: note card renders category badge — VOCAB (primary blue), THINKING (amber), COMPLEX (violet)
- UI: category selector renders as 3-option control (not free text) in note creation form
- UI: filtering by category in note browser returns correct subset

## Subtasks

- Add `category` filter to `list_notes()` query in `packages/core/db/notes.ts`
- Add `?category=` param handling to GET `/api/notes` route
- Add `CategoryBadge` component in `packages/ui/components/`
- Add 3-option category selector to note creation and edit forms
- Color map as named constant: `CATEGORY_COLORS: Record<NoteCategory, string>`

## Avoid

Do not use raw hex values for badge colors in the component — reference predefined Tailwind tokens only. Do not allow category to be nullable; it must always have a value (default: 'vocab').
