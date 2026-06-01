# S0-07 — React Route Stubs

Creates the three top-level archetype routes in the React app so the client-side router is wired correctly from Sprint 0. These are blank placeholder pages — no components, no data fetching — but they must render without errors and establish the navigation structure all subsequent sprints will fill in.

## Goals

- React Router (or TanStack Router) configured with routes for `/notes`, `/working`, `/recall`
- Each route renders a named placeholder component with zero console errors
- Navigation between routes works without full page reload
- 404 route renders a fallback for any unmatched path

## Acceptance Criteria

- Navigating to `http://localhost:3000/notes` renders "Notes" placeholder without error
- Navigating to `http://localhost:3000/working` renders "Working" placeholder without error
- Navigating to `http://localhost:3000/recall` renders "Recall" placeholder without error
- Navigating to `http://localhost:3000/unknown` renders a 404 fallback without error
- Clicking between routes does not trigger a full browser reload (client-side navigation confirmed)
- Browser console shows zero errors on any route
- React DevTools shows correct component tree for each route

## Subtasks

- Install and configure router (`react-router-dom` v6 or TanStack Router)
- Create `NotesPage.tsx`, `WorkingPage.tsx`, `RecallPage.tsx` as named stub components
- Create `NotFoundPage.tsx` for unmatched routes
- Wire routes in `App.tsx` with `<Routes>` or equivalent
- Add minimal nav bar with links to all three routes (unstyled at this stage)

## Avoid

Do not add any state management, data fetching, or component logic beyond the route render — stubs must be trivially simple. Do not configure route-level code splitting yet; that is a polish concern for Sprint 6.
