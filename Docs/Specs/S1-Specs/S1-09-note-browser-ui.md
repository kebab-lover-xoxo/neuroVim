# S1-09 — Note Browser UI

Delivers the Notes archetype interface at /notes. The browser must feel like a terminal file explorer — dense, keyboard-navigable, and deliberately minimal. It is the primary surface for the Notes archetype.

## Goals

- List of notes with title, category badge, topic path, and tags visible
- Topic tree sidebar for bin navigation
- Tag and category filters
- Click-to-open note detail with body, summary, and links

## Acceptance Criteria

- `/notes` renders list of all notes with title, category badge, truncated body preview
- Topic tree renders in sidebar; clicking a topic filters list to that topic's notes
- Tag filter chips render above list; clicking filters by tag
- Category filter renders; clicking filters by category
- Clicking a note opens detail view: full body, summary region, linked notes
- Note detail shows all tags and topic path breadcrumb
- Empty state: no notes renders "Create your first atom" with new note CTA
- New note button opens creation form inline or in split pane
- All filter combinations work (topic + tag + category simultaneously)

## Subtasks

- Create `NotesPane` layout in `packages/ui/archetypes/Notes/`
- Create `NoteList`, `NoteCard`, `NoteDetail` components
- Create `TopicSidebar` component consuming GET /api/topics
- Create `TagFilterBar` and `CategoryFilterBar` components
- Zustand store for active note, active filters
- All components use predefined Tailwind tokens; no arbitrary values

## Avoid

Do not build note editing inside this spec — that depends on S1-01 and S1-02 routes already tested. Do not implement drag-and-drop topic assignment yet. Keep layout flat and dense — no cards with shadows or rounded corners larger than 2px.
