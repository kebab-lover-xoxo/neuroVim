# S0-10 — Data Volume Persistence

Verifies that the SQLite database and any future media files survive container restarts and rebuilds. Persistence is non-negotiable for a learning app — losing review history or notes on a container restart would be a critical failure.

## Goals

- `./data/` directory on host is mounted to `/data/` inside the container
- `mnemo.db` is created inside `/data/` not inside the container filesystem
- Container rebuild (`docker compose up --build`) does not destroy existing data
- `.gitignore` excludes `data/` from version control

## Acceptance Criteria

- After `docker compose up`, insert a test row: `INSERT INTO notes(id, title, body, category) VALUES ('test-1', 'Test', 'Body', 'vocab')`
- `docker compose down` followed by `docker compose up` (no `--build`): `SELECT * FROM notes WHERE id='test-1'` returns the row
- `docker compose down` followed by `docker compose up --build`: row still present
- `ls ./data/` on the host shows `mnemo.db` (and `-wal`, `-shm` sidecar files)
- `data/` is listed in `.gitignore`; `git status` shows it as ignored
- `PRAGMA integrity_check` returns `ok` after restart

## Subtasks

- Confirm `docker-compose.yml` volume mount: `./data:/data`
- Confirm `DB_PATH` env var points to `/data/mnemo.db` in container
- Add `./data/.gitkeep` so the directory is tracked in git but contents are ignored
- Write `.gitignore` entry: `data/*.db`, `data/*.db-wal`, `data/*.db-shm`, `data/media/`
- Add startup log line showing resolved DB path so persistence can be confirmed visually

## Avoid

Do not store `mnemo.db` inside the Docker image layers — it must always live on the mounted volume. Do not commit any `.db` files to the repository under any circumstances.
