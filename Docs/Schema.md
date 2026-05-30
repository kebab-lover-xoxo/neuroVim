# Learning Application — Database Schema (v3)

## Local, single-user, SQLite

-----

## Enums (TEXT + CHECK in SQLite)

```
chunk_type:   'working' | 'recall'
              -- working: user browses/writes notes with atoms
              -- recall:  FSRS card review session
card_type:    'standard' | 'mcq'
fsrs_rating:  'again' | 'hard' | 'good' | 'easy'
session_state:'active' | 'completed' | 'abandoned'
card_state:   'new' | 'learning' | 'review' | 'relearning'
media_type:   'image' | 'audio'
```

-----

## Notes Layer

### `topics`

Topic (0) → Chapter (1) → Section (2)

```sql
CREATE TABLE topics (
  id         TEXT PRIMARY KEY,
  parent_id  TEXT REFERENCES topics(id) ON DELETE CASCADE,
  depth      INTEGER NOT NULL DEFAULT 0 CHECK (depth BETWEEN 0 AND 2),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL,
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (parent_id, slug)
);
```

### `tags`

```sql
CREATE TABLE tags (
  id    TEXT PRIMARY KEY,
  name  TEXT NOT NULL UNIQUE,
  color TEXT
);
```

### `notes`

```sql
CREATE TABLE notes (
  id         TEXT PRIMARY KEY,
  topic_id   TEXT REFERENCES topics(id) ON DELETE SET NULL,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  summary    TEXT,               -- Feynman restatement
  category   TEXT NOT NULL DEFAULT 'vocab'
               CHECK (category IN ('vocab', 'thinking', 'complex')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### `note_tags`

```sql
CREATE TABLE note_tags (
  note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id  TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);
```

### `note_links`

```sql
CREATE TABLE note_links (
  source_id  TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  target_id  TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  label      TEXT,               -- 'extends' | 'contradicts' | 'exemplifies' | ...
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (source_id, target_id),
  CHECK (source_id != target_id)
);
```

### `media`

```sql
CREATE TABLE media (
  id         TEXT PRIMARY KEY,
  note_id    TEXT REFERENCES notes(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'audio')),
  path       TEXT NOT NULL,
  mime_type  TEXT NOT NULL,
  alt_text   TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

-----

## Session Layer

### `sessions`

Container. No archetype pre-declared — the chunks inside determine what happened.

```sql
CREATE TABLE sessions (
  id          TEXT PRIMARY KEY,
  title       TEXT,
  state       TEXT NOT NULL DEFAULT 'active'
                CHECK (state IN ('active', 'completed', 'abandoned')),
  review_note TEXT,              -- end-of-session synthesis
  started_at  TEXT NOT NULL DEFAULT (datetime('now')),
  ended_at    TEXT
);
```

### `session_chunks`

User opens and closes chunks freely during a session.
A chunk is either a working unit (notes + atoms) or a recall unit (FSRS cards).
Position is assigned at close time (append order).

```sql
CREATE TABLE session_chunks (
  id          TEXT PRIMARY KEY,
  session_id  TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  chunk_type  TEXT NOT NULL DEFAULT 'working'
                CHECK (chunk_type IN ('working', 'recall')),
  label       TEXT,              -- optional user label
  position    INTEGER,           -- set when chunk is closed, reflects open order

  -- Lifecycle timestamps
  opened_at   TEXT NOT NULL DEFAULT (datetime('now')),
  closed_at   TEXT               -- NULL while chunk is active
);
```

### `chunk_buffers`

Pause/resume periods within a chunk. Multiple allowed per chunk.

```sql
CREATE TABLE chunk_buffers (
  id         TEXT PRIMARY KEY,
  chunk_id   TEXT NOT NULL REFERENCES session_chunks(id) ON DELETE CASCADE,
  paused_at  TEXT NOT NULL,
  resumed_at TEXT,               -- NULL while paused
  reason     TEXT                -- optional user note
);

-- Net active time per chunk:
-- SUM(COALESCE(resumed_at, datetime('now')) - paused_at) subtracted from
-- (closed_at - opened_at)
```

### `chunk_atoms`

Working chunks only (chunk_type = ‘working’). ≤9 notes per chunk.
Atoms are added as the user works, not pre-declared.

```sql
CREATE TABLE chunk_atoms (
  chunk_id  TEXT NOT NULL REFERENCES session_chunks(id) ON DELETE CASCADE,
  note_id   TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  added_at  TEXT NOT NULL DEFAULT (datetime('now')),
  position  INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (chunk_id, note_id)
  -- App enforces: SELECT COUNT(*) FROM chunk_atoms WHERE chunk_id = ? < 9
);
```

-----

## FSRS Layer

### `fsrs_params`

FSRS-5: exactly 19 weights (w0–w18). One active set at a time.

```sql
CREATE TABLE fsrs_params (
  id         TEXT PRIMARY KEY,
  version    INTEGER NOT NULL UNIQUE,
  weights    TEXT NOT NULL,      -- JSON array, length 19: [w0..w18]
  note       TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  active     INTEGER NOT NULL DEFAULT 1  -- boolean; app ensures only one = 1
);

INSERT INTO fsrs_params (id, version, weights, note) VALUES (
  'default', 1,
  '[0.4072,1.1829,3.1262,15.4722,7.2102,0.5316,1.0651,0.0589,
    1.4684,0.1544,1.004,1.9813,0.0953,0.2975,2.2042,0.2407,
    2.9466,0.5034,0.6567]',
  'FSRS-5 published defaults'
);
```

### `cards`

```sql
CREATE TABLE cards (
  id           TEXT PRIMARY KEY,
  note_id      TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  card_type    TEXT NOT NULL DEFAULT 'standard'
                 CHECK (card_type IN ('standard', 'mcq')),

  front        TEXT NOT NULL,
  front_media  TEXT REFERENCES media(id) ON DELETE SET NULL,
  back         TEXT NOT NULL,
  back_media   TEXT REFERENCES media(id) ON DELETE SET NULL,

  -- MCQ (NULL for standard)
  mcq_options  TEXT,             -- JSON: [{text, is_correct, media_id?}, ...]
  mcq_shuffle  INTEGER NOT NULL DEFAULT 1,

  -- FSRS-5 state
  stability      REAL NOT NULL DEFAULT 0,
  difficulty     REAL NOT NULL DEFAULT 5,
  due_at         TEXT NOT NULL DEFAULT (datetime('now')),
  last_review    TEXT,
  elapsed_days   REAL NOT NULL DEFAULT 0,   -- t: days since last review
  scheduled_days REAL NOT NULL DEFAULT 0,   -- interval assigned at last review
  reps           INTEGER NOT NULL DEFAULT 0,
  lapses         INTEGER NOT NULL DEFAULT 0,
  state          TEXT NOT NULL DEFAULT 'new'
                   CHECK (state IN ('new', 'learning', 'review', 'relearning')),

  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX cards_due_idx ON cards (due_at) WHERE state != 'new';
```

### `reviews`

Immutable log. Each row is one card rating event.

```sql
CREATE TABLE reviews (
  id           TEXT PRIMARY KEY,
  card_id      TEXT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  chunk_id     TEXT REFERENCES session_chunks(id) ON DELETE SET NULL,
  -- chunk_id links review to a recall-type chunk

  rating       TEXT NOT NULL CHECK (rating IN ('again', 'hard', 'good', 'easy')),
  response_ms  INTEGER,          -- retrieval latency, fluency signal

  scheduled_at   TEXT NOT NULL,  -- when card was due
  reviewed_at    TEXT NOT NULL DEFAULT (datetime('now')),
  elapsed_days   REAL NOT NULL DEFAULT 0,  -- t at moment of review

  -- Pre-review FSRS snapshot (optimizer replay)
  pre_stability  REAL,
  pre_difficulty REAL,
  pre_state      TEXT,
  pre_reps       INTEGER,
  pre_lapses     INTEGER
);

CREATE INDEX reviews_card_idx ON reviews (card_id, reviewed_at);
CREATE INDEX reviews_chunk_idx ON reviews (chunk_id);
```

-----

## Schema Map

```
topics (0=Topic / 1=Chapter / 2=Section)
  └── notes
        ├── note_tags ──── tags
        ├── note_links (semantic graph)
        ├── media
        └── cards
              └── reviews ──── session_chunks (recall type)

sessions
  └── session_chunks  [opened/closed fluidly, any order]
        │   chunk_type = 'working'  →  chunk_atoms (≤9 notes)
        │   chunk_type = 'recall'   →  reviews FK back here
        └── chunk_buffers (0..n pause/resume periods per chunk)

fsrs_params (versioned, one active)
```

-----

## Chunk Lifecycle (application logic)

```
User opens session
  → INSERT sessions

User starts a working chunk
  → INSERT session_chunks (chunk_type='working', opened_at=now)
  → User adds notes → INSERT chunk_atoms (up to 9)
  → User pauses    → INSERT chunk_buffers (paused_at=now)
  → User resumes   → UPDATE chunk_buffers SET resumed_at=now
  → User closes    → UPDATE session_chunks SET closed_at=now, position=n

User starts a recall chunk (mid-session)
  → INSERT session_chunks (chunk_type='recall', opened_at=now)
  → FSRS surfaces due cards
  → Each rating → INSERT reviews (chunk_id = this chunk)
  → User pauses/resumes → chunk_buffers same as above
  → User closes → UPDATE session_chunks SET closed_at=now, position=n

User can interleave as many chunks of either type as desired.

Session end
  → UPDATE sessions SET state='completed', ended_at=now
  → Optional review_note written
```

-----
