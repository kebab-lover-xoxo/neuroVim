# S0-05 — FSRS-5 Default Weight Seed

Inserts the published FSRS-5 default weight set into `fsrs_params` so the scheduler has valid parameters from the first run without requiring an optimizer pass. This seed is the fallback for all FSRS compute until the user has enough review history to run the optimizer.

## Goals

- Seed SQL runs as part of the migration or startup sequence
- Exactly 19 weights (w0–w18) stored as a JSON array in `fsrs_params.weights`
- Row is marked `active=1`
- Seed is idempotent: running it twice does not create a duplicate row

## Acceptance Criteria

- `SELECT * FROM fsrs_params` returns exactly 1 row after fresh container start
- `json_array_length(weights)` returns `19`
- Weight values match FSRS-5 published defaults: `[0.4072, 1.1829, 3.1262, 15.4722, 7.2102, 0.5316, 1.0651, 0.0589, 1.4684, 0.1544, 1.004, 1.9813, 0.0953, 0.2975, 2.2042, 0.2407, 2.9466, 0.5034, 0.6567]`
- `active` column equals `1`
- Running the seed script a second time leaves exactly 1 row (no duplicate)
- `version` column equals `1`

## Subtasks

- Add seed as a Drizzle migration file (runs after schema migration, before app start)
- Use `INSERT OR IGNORE INTO fsrs_params` with `id='default'` to ensure idempotency
- Write a startup assertion in `packages/core` that checks `fsrs_params` has an active row; throws if absent
- Document the 19 default weight values with w-index comments in `schema.ts`

## Avoid

Do not hard-code the weight array anywhere outside `drizzle/migrations/` and the schema documentation — the application must always read weights from the database at runtime, never from a constant. Do not allow more than one `active=1` row; enforce this in application logic from the start.
