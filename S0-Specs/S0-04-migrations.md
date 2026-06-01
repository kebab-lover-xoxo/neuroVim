# S0-04 — Drizzle Migrations

Applies the full v3 schema to the SQLite database via Drizzle ORM migrations, establishing the canonical table structure that all subsequent sprints depend on. Every table must exist with correct columns, types, constraints, and indexes before any application code touches the database.

## Goals

- `drizzle/schema.ts` defines all 12 tables matching schema v3 spec exactly
- `drizzle-kit generate` produces migration SQL files from the schema
- `drizzle-kit migrate` applies migrations to `/data/mnemo.db` on container start
- All CHECK constraints, foreign keys, and indexes present in the applied schema

## Acceptance Criteria

- `drizzle-kit migrate` runs without error against a fresh SQLite file
- `SELECT name FROM sqlite_master WHERE type='table'` returns all 12 table names: `topics`, `tags`, `notes`, `note_tags`, `note_links`, `media`, `sessions`, `session_chunks`, `chunk_atoms`, `chunk_buffers`, `cards`, `reviews`, `fsrs_params`
- `PRAGMA table_info(cards)` shows `stability`, `difficulty`, `due_at`, `elapsed_days`, `scheduled_days`, `reps`, `lapses`, `state` columns with correct types
- CHECK constraint on `topics.depth` rejects insert with `depth=3`
- Foreign key `chunk_atoms.note_id` references `notes.id` with CASCADE delete
- `CREATE INDEX cards_due_idx` present: `PRAGMA index_list(cards)` confirms it
- `drizzle-kit generate` after no schema changes produces zero new migration files

## Subtasks

- Write `drizzle/schema.ts` with all 12 tables using Drizzle's SQLite dialect
- Configure `drizzle.config.ts`: dialect, schema path, migrations output path, `dbCredentials`
- Add migration runner to Express startup: `migrate(db, { migrationsFolder: './drizzle/migrations' })`
- Test CHECK constraint rejection for `topics.depth > 2`
- Test CASCADE delete on `chunk_atoms` when parent `session_chunks` row deleted
- Verify `cards_due_idx` partial index created correctly

## Avoid

Do not hand-write SQL migration files — always generate them from `schema.ts` via `drizzle-kit generate`. Do not apply migrations manually; the server must run them automatically on startup so the Docker container is self-initialising.
