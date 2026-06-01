# S0-06 — SQLite WAL Mode

Configures SQLite to use Write-Ahead Logging (WAL) journal mode on every database connection open. WAL allows concurrent reads during writes, which prevents the recall archetype's read-heavy due-card queries from blocking review write operations.

## Goals

- WAL mode set via `PRAGMA journal_mode = WAL` on every new connection
- Confirmed active before any application queries run
- `PRAGMA synchronous = NORMAL` set alongside WAL (correct pairing for WAL mode)
- WAL mode persists across container restarts (SQLite persists this in the DB file)

## Acceptance Criteria

- `PRAGMA journal_mode` returns `wal` immediately after connection open
- `-wal` and `-shm` sidecar files appear in `/data/` alongside `mnemo.db`
- App starts and serves requests normally with WAL mode active
- `PRAGMA synchronous` returns `1` (NORMAL)
- Restarting the container without `--build` still shows WAL mode active (persisted in DB file)

## Subtasks

- Add WAL pragma to the `better-sqlite3` connection initialisation in `packages/core/db.ts`
- Add synchronous pragma in the same initialisation block
- Add a startup log line confirming `journal_mode=wal`
- Write a test that opens the DB and asserts `PRAGMA journal_mode` returns `wal`

## Avoid

Do not set `PRAGMA journal_mode = MEMORY` or `DELETE` anywhere in the codebase — these override WAL and will cause data loss. Do not skip the `synchronous = NORMAL` pragma; using `FULL` with WAL is unnecessarily slow, and `OFF` risks corruption on power loss.
