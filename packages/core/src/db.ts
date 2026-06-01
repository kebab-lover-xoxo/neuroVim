import fs from 'fs';
import path from 'path'; // Ensure path module is imported
import Database from 'better-sqlite3';

type Sqlite = any;

const repoRoot = path.resolve(__dirname, '..', '..', '..');

export function resolveDatabasePath(): string {
  return process.env.DB_PATH || path.resolve(repoRoot, 'data', 'mnemo.db');
}

export function createDatabase(dbPath?: string): any {
  const resolvedPath = dbPath || resolveDatabasePath();
  const dataDir = path.dirname(resolvedPath);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const sqlite = new Database(resolvedPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('synchronous = NORMAL');
  sqlite.pragma('foreign_keys = ON');

  const journalMode = sqlite.pragma('journal_mode', { simple: true });
  console.log(`SQLite journal_mode=${journalMode} path=${resolvedPath}`);

  return { sqlite, path: resolvedPath };
}

export function ensureFsrsParamsSeeded(sqlite: Sqlite) {
  const activeCount: any = sqlite.prepare('SELECT COUNT(*) AS count FROM fsrs_params WHERE active = 1').get();
  if (!activeCount || activeCount.count !== 1) {
    throw new Error('Expected exactly one active fsrs_params row after migration and seed.');
  }

  const weightsLength: any = sqlite.prepare('SELECT json_array_length(weights) AS length FROM fsrs_params WHERE active = 1').get();
  if (!weightsLength || weightsLength.length !== 19) {
    throw new Error('Expected exactly 19 FSRS weights in active fsrs_params row.');
  }
}
