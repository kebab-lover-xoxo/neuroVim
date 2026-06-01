# Mn## Neurovim — Engineering & Architecture Standards

## 1. Architecture

A local-first, single-user application with a clean three-layer separation where each layer owns a single responsibility.

|Layer      |Technology                                 |Responsibility                                       |
|-----------|-------------------------------------------|-----------------------------------------------------|
|Frontend   |React + TypeScript                         |UI, routing, three-archetype interface, local state  |
|API Adapter|Express (Docker) / Tauri Commands (Desktop)|Thin transport over core logic                       |
|Core Logic |TypeScript (`packages/core`)               |FSRS scheduling, session lifecycle, DB queries, types|
|Data Access|Drizzle ORM                                |Type-safe queries, schema migrations                 |
|Database   |SQLite (WAL mode)                          |Single file, offline-first, constraints enforced     |

**Principle:** Core logic is framework-agnostic. Express and Tauri are interchangeable transports. The same core runs identically in both Docker prototype and Tauri production.

-----

## 2. Naming Conventions

|Asset                |Convention                            |Example                                        |
|---------------------|--------------------------------------|-----------------------------------------------|
|Files                |kebab-case                            |card-browser.tsx, fsrs-scheduler.ts            |
|Top-level directories|kebab-case                            |packages/, apps/, drizzle/                     |
|Module directories   |PascalCase                            |ChunkAtoms/, SessionHandlers/                  |
|Variables & functions|snake_case                            |due_at, get_due_cards(), elapsed_days          |
|Classes & types      |PascalCase                            |CardState, SessionChunk, FsrsParams            |
|Database tables      |snake_case                            |session_chunks, chunk_buffers, fsrs_params     |
|Environment variables|UPPER_SNAKE                           |DB_PATH, NODE_ENV, MAX_UPLOAD_MB               |
|Component files      |kebab-case filename, PascalCase export|recall-pane.tsx → RecallPane                   |
|Interfaces/types     |No I prefix                           |SessionState, ChunkBuffer, Review              |
|Booleans             |is_, has_, can_                       |is_active, has_media, can_pause                |
|FSRS fields          |Abbreviated                           |stability (S), difficulty (D), elapsed_days (t)|

-----

## 3. Directory Organization

### Workspace Layout

```
packages/
  core/
    fsrs/           ← FSRS scheduler, optimizer, types
    session/        ← Session and chunk lifecycle
    db/             ← Database client, queries, migrations
    media/          ← Media upload, validation
    types/          ← Shared TypeScript types
    index.ts        ← Public API exports

  ui/
    archetypes/     ← Notes/, Working/, Recall/ panes
    components/     ← Shared UI components
    hooks/          ← React hooks (useSession, useChunk, etc.)
    lib/            ← Utilities, constants, formatting
    state/          ← Zustand stores
    styles/         ← Tailwind config, CSS variables
    pages/          ← Page-level layouts
    types.ts        ← UI-specific types

apps/
  web/              ← Express server (Docker target)
    server.ts
    routes/         ← API route handlers
    middleware/     ← Auth, validation, logging
    
  desktop/          ← Tauri shell (future, Phase 2)
    src-tauri/
    src/            ← Tauri-specific code

drizzle/
  schema.ts         ← Single schema source of truth
  migrations/       ← Auto-generated SQL

data/               ← SQLite file + media (gitignored)
```

### Module Organization

**By Responsibility, not by Type**

```
// GOOD
core/fsrs/
  scheduler.ts      ← Core scheduling algorithm
  optimizer.ts      ← Weight optimization
  types.ts          ← FSRS-specific types

core/session/
  lifecycle.ts      ← Open/close session, chunk logic
  timing.ts         ← Pause/resume, net active time
  types.ts          ← Session, Chunk, Buffer types

// AVOID
core/
  schedulers/
  optimizers/
  handlers/
  types/
```

-----

## 4. Execution Philosophy

### Core Principle

**Minimize explicit control-flow divergence.** Prefer data-driven execution, immutable state, and schema-validated boundaries over imperative branching.

### Use Data-Driven Dispatch For

- Chunk type routing (working vs recall)
- FSRS state transitions (new → learning → review → relearning)
- Rating handling (again / hard / good / easy)
- Archetype pane rendering
- Card type rendering (standard vs MCQ)

### Branching Is Appropriate For

- Guard clauses (Miller’s cap validation, session state checks)
- Input validation (schema validation via Drizzle/Zod)
- Error handling (review log write failure, media upload rejection)
- Early exits (chunk already closed, card not found)
- Simple local business logic (pause logic is simple; use if/else)

### Avoid

- Deeply nested if/else (3+ levels)
- Repeated branching on the same variable (use dispatch map instead)
- switch statements with 3+ cases (use dispatch map instead)
- Nested ternaries (name intermediate booleans)
- Complex JSX conditionals inline (extract to function)
- Multiple conditions in a single if statement (name each boolean)

### Prefer

- **Dispatch maps for rating handlers:**
  
  ```typescript
  const ratingHandlers: Record<FsrsRating, (card: Card) => Card> = {
    again: handleAgain,
    hard: handleHard,
    good: handleGood,
    easy: handleEasy,
  };
  const updated = ratingHandlers[rating](card);
  ```
- **Dispatch maps for chunk types:**
  
  ```typescript
  const chunkHandlers: Record<ChunkType, (chunk: Chunk) => Promise<void>> = {
    working: handleWorkingClose,
    recall: handleRecallClose,
  };
  await chunkHandlers[chunk.type](chunk);
  ```
- **Boolean reduction before conditions:**
  
  ```typescript
  const can_add_atom = chunk_atom_count < 9 && session.state === 'active';
  if (can_add_atom) { addAtom(chunk, note); }
  ```
- **Functional transforms over loops:**
  
  ```typescript
  const net_active_time = buffers
    .map(b => (b.resumed_at || now) - b.paused_at)
    .reduce((a, b) => a + b, 0);
  ```
- **Optional chaining and nullish coalescing:**
  
  ```typescript
  const due_at = card?.due_at ?? new Date();
  const label = link?.label ?? 'relates-to';
  ```

### Mandatory

- Strict schema validation on all external inputs (Drizzle, Zod, or runtime checks)
- Named booleans before compound conditions (never inline 3+ condition checks)
- No inline regex (define at module level with comments)
- No inline cryptography
- Immutable updates (never mutate function arguments or shared state)
- Initialize FSRS params, DB connection, and media path once at startup

-----

## 5. Adapted NASA Power of Ten for Mnemo

### Rule 1 — Simple Control Flow

- Avoid nesting deeper than 2 levels.
- Chunk type routing and FSRS state dispatch should be flat (dispatch maps, not nested if).
- Guard clauses are encouraged for early returns.

### Rule 2 — Bounded Iteration

- Loops must have explicit upper bounds (Array.slice with limits, pagination, etc.).
- FSRS optimizer loops over review_log with explicit batch size.
- Due card queue has configurable limit (NEW_CARDS_PER_DAY).

### Rule 3 — Resource Stability

- Initialize SQLite connection once in `packages/core/db.ts` on app startup.
- Reuse single DB client across all requests (Express middleware, Tauri command context).
- FSRS params loaded once at startup; read-only in request handlers.
- Media path resolved once at startup.

### Rule 4 — Small Functions

- Handlers should stay under 20 lines.
- Extract named helpers: `handle_lapse()`, `calculate_net_active_time()`, `validate_atom_cap()`.
- Components should have single responsibility: NotesPane, WorkingPane, RecallPane.

### Rule 5 — Low Density Logic

- One declaration per line.
- Name intermediate booleans before conditions.
- No inline calculations in conditionals.

```typescript
// GOOD
const is_at_cap = chunk_atoms.length >= 9;
const session_is_active = session.state === 'active';
const can_add = !is_at_cap && session_is_active;
if (can_add) { /* ... */ }

// AVOID
if (chunk_atoms.length >= 9 && session.state === 'active' && !user_has_paused) {
```

### Rule 6 — Minimal Scope

- Declare variables near usage.
- Use const by default; never use var.
- Session state lives in Zustand; chunk state lives in Zustand or immediate component state.
- Review pre-state snapshots are read-only.

### Rule 7 — Validate Everything

- All API route inputs validated via Drizzle schema or explicit checks.
- Rating input: verify value is in (‘again’, ‘hard’, ‘good’, ‘easy’).
- Chunk atom add: verify count < 9, session active, note exists.
- Media upload: MIME type whitelist, file size cap, alt_text required.

### Rule 8 — Explicit Configuration

- No environment-based behavior shifts in the app. Use config objects instead.
  
  ```typescript
  // GOOD
  const FSRS_CONFIG = {
    NEW_CARDS_PER_DAY: parseInt(process.env.NEW_CARDS_PER_DAY || '20'),
    OPTIMIZER_MIN_REVIEWS: 30,
  };
  
  // AVOID
  if (process.env.NODE_ENV === 'production') { /* specific logic */ }
  ```

### Rule 9 — Immutability by Default

- Never mutate card state before inserting into reviews table.
- FSRS updates return a new card object, never modify in place.
- Session updates: `db.updateSession({ ...session, state: 'completed' })`, not `session.state = ...`.
- React state: `setChunks([...chunks, newChunk])`, never `chunks.push(newChunk)`.

### Rule 10 — Zero-Warning Enforcement

- `tsc --noEmit` must pass with zero errors (strict: true enabled).
- `eslint .` must pass with zero errors.
- `prettier --check .` must pass with zero violations.
- No `// @ts-ignore`, `// eslint-disable`, or similar workarounds.

-----

## 6. Pattern Reference

### Dispatch Maps (Preferred for 3+ Cases)

```typescript
// FSRS rating handler
type RatingHandler = (card: Card, reviewed_at: Date) => Card;

const rating_handlers: Record<FsrsRating, RatingHandler> = {
  again: (card, date) => ({
    ...card,
    lapses: card.lapses + 1,
    state: 'relearning',
    stability: Math.max(0, card.stability * 0.36), // forgetting curve
  }),
  hard: (card, date) => ({
    ...card,
    difficulty: Math.min(10, card.difficulty + 0.29),
    stability: card.stability * 0.54,
    state: 'learning',
  }),
  good: (card, date) => {
    const new_stability = card.stability * 1.26 - 0.85 * (card.difficulty - 4);
    return { ...card, stability: Math.max(0, new_stability), state: 'review' };
  },
  easy: (card, date) => {
    const new_stability = card.stability * 2.5;
    return { ...card, stability: new_stability, state: 'review' };
  },
};

// Usage
const updated_card = rating_handlers[rating](card, new Date());
```

### Boolean Reduction

```typescript
// GOOD
const is_new = card.state === 'new';
const is_due = card.due_at <= now;
const can_review = is_due && !session.is_paused;

if (can_review) {
  presentCard(card);
}

// AVOID
if (card.state !== 'new' && card.due_at <= now && !session.is_paused) {
  presentCard(card);
}
```

### Guard Clauses

```typescript
async function add_atom(chunk_id: string, note_id: string) {
  const chunk = await db.getChunk(chunk_id);
  if (!chunk) throw new Error('Chunk not found');
  if (chunk.closed_at) throw new Error('Chunk is closed');
  
  const atom_count = await db.countChunkAtoms(chunk_id);
  if (atom_count >= 9) throw new Error('Miller cap reached');
  
  const note = await db.getNote(note_id);
  if (!note) throw new Error('Note not found');
  
  return db.insertChunkAtom({ chunk_id, note_id });
}
```

### Functional Transforms

```typescript
// Calculate net active time per chunk
function get_net_active_time(chunk_id: string, buffers: ChunkBuffer[]): number {
  const chunk = db.getChunk(chunk_id);
  const gross_ms = chunk.closed_at.getTime() - chunk.opened_at.getTime();
  
  const paused_ms = buffers
    .map(b => (b.resumed_at || now()).getTime() - b.paused_at.getTime())
    .reduce((sum, ms) => sum + ms, 0);
  
  return gross_ms - paused_ms;
}

// Calculate session accuracy
function get_session_accuracy(session_id: string, reviews: Review[]): number {
  const relevant = reviews.filter(r => r.session_id === session_id);
  const correct = relevant.filter(r => r.rating !== 'again').length;
  return relevant.length > 0 ? correct / relevant.length : 0;
}
```

### Local Business Logic (Simple Cases)

Simple two-case decisions may use ordinary if/else:

```typescript
// GOOD — simple, clear
if (buffer.resumed_at) {
  // Buffer is already resumed
  return;
} else {
  db.updateBuffer(buffer_id, { resumed_at: now() });
}

// AVOID — dispatch map is overkill for this
```

-----

## 7. Infrastructure Principles

### Docker

- Multi-stage builds: separate builder and runtime images.
- Run as non-root user (uid 1000).
- No embedded secrets; use environment variables only.
- Image size < 200 MB (target: < 150 MB).
- Integrity check on startup: `PRAGMA integrity_check` returns ‘ok’.

### SQLite

- WAL mode enabled on all connections.
- Synchronous = NORMAL (optimal for WAL).
- Volume mounted to persist across restarts.
- Database file backed up before any destructive operation.
- All constraints (CHECK, FK, NOT NULL) enforced at schema level.

### Networking

- Single exposed port (3000 for Docker, Tauri native for desktop).
- Reverse proxy (Caddy or Nginx) for TLS and rate limiting (future).
- All API responses include Content-Type header.
- CORS policy strict (same-origin only for v1).

### State Management

- Session state in Zustand (persists via localStorage).
- Chunk state in Zustand (loses on refresh, reloadable from API).
- FSRS card state read-only from DB (never mutated in memory).
- Media paths resolved once at startup, immutable.

-----

## 8. AI-Assisted Code Generation Rules

### Mandatory

1. Follow naming conventions (snake_case for functions/variables, PascalCase for types).
1. Validate all external inputs with strict Drizzle schemas or explicit runtime checks.
1. Use immutable updates (spread operator, no direct mutations).
1. Initialize DB connection, FSRS params, and media path once at startup.
1. No inline regex (define at module level with // comments).
1. No inline cryptography or secrets.
1. Keep functions under 25 lines; extract named helpers when logic grows.
1. Name intermediate booleans before conditions.
1. Generate complete, runnable code (not pseudo-code).
1. Maintain zero warnings: `tsc`, `eslint`, `prettier` must all pass.

### Strongly Preferred

1. Dispatch maps for 3+ case routing (chunk type, FSRS rating, card type).
1. Boolean reduction for compound guards.
1. Functional transforms (map, filter, reduce) over imperative loops.
1. Single responsibility functions.
1. Guard clauses for early returns.

### Permitted

1. Early returns for simple guards (chunk closed, note not found, etc.).
1. if/else for small local decisions (2-case branching with < 5 lines each).
1. Simple non-nested ternaries (one level only, readable).

### Never Acceptable

- Deep nested branching (3+ levels)
- switch statements with 3+ cases
- Nested ternaries
- Repeated branching on the same variable
- Mutating function arguments or shared state
- Inline regex
- Inline cryptography
- var declarations
- Hardcoded magic numbers (use named constants)
- Comments explaining what code does (code should be self-explanatory)

-----

## 9. Code Review Checklist

Every pull request must pass:

- [ ] Naming conventions followed (snake_case, PascalCase, kebab-case correct)
- [ ] All external inputs validated with schema
- [ ] No mutations of function arguments or shared state
- [ ] Dispatch maps used for 3+ cases
- [ ] Functions stay under 25 lines
- [ ] tsc –noEmit passes
- [ ] eslint . passes
- [ ] prettier –check . passes
- [ ] No console.log or debugger statements
- [ ] Comments explain why, not what
- [ ] Tests pass (Vitest, Playwright)
- [ ] Schema migrations generated if DB changes
- [ ] Environment variables documented in README

-----

## 10. Testing Strategy

### Unit Tests (Vitest)

- FSRS scheduler: verify state transitions for each rating
- Timing calculations: elapsed_days, net_active_time
- Validation: Miller cap, category enum, FSRS bounds
- Immutability: state updates do not mutate originals

### Integration Tests (Playwright)

- Session lifecycle: open → chunk → pause → resume → close
- Card review flow: fetch due → rate → verify logging
- Note creation and linking: create → link → query graph
- Media upload: validate MIME, verify file persists

### Test Coverage Target

- Core logic (packages/core): 80%+ coverage
- API handlers: 60%+ coverage
- UI components: smoke tests for render

-----

## 11. Documentation Standards

Every module must include:

1. **Top-level comment:** What does this module do in one sentence.
1. **Function docstring:** Parameters, return type, throws.
1. **Dispatch map comment:** Which cases does it handle.
1. **Non-obvious algorithm:** Explain FSRS formulas, net active time calculation, etc.

```typescript
/**
 * Core FSRS-5 scheduler. Updates card state and next due date based on rating.
 * Uses reference Rust implementation weights; never modify inline.
 */

/**
 * Handle "again" rating: increment lapses, drop stability, relearning state.
 * Follows FSRS-5 forgetting curve formula: S' = S * (0.36)
 */
function handleAgain(card: Card): Card {
  const new_stability = Math.max(0, card.stability * 0.36);
  return {
    ...card,
    lapses: card.lapses + 1,
    state: 'relearning',
    stability: new_stability,
  };
}
```

-----

## 12. Performance Constraints

- Card flip UI response: < 100ms
- Due card query: < 500ms for 1000 cards
- FSRS optimizer: < 2s for 1000 reviews
- Graph render (200 nodes): 30+ fps
- Cold app start (Docker/Tauri): < 2s

-----

## 13. Security Constraints

- No SQL injection: all queries via Drizzle ORM
- No XSS: React escapes by default; sanitize user-provided HTML if needed
- No auth bypass: skip auth logic for v1 (single-user), implement in v2
- Media upload: MIME whitelist, size cap, no execution
- Secrets: environment variables only, never in code

-----
