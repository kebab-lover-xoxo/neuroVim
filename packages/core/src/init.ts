import { execSync } from 'child_process';
import path from 'path';
import { createDatabase, ensureFsrsParamsSeeded } from './db';

const repoRoot = path.resolve(__dirname, '..', '..', '..');

export function initializeDatabase(): { sqlite: any } {
  execSync('pnpm exec drizzle-kit migrate --config drizzle.config.ts', {
    cwd: repoRoot,
    stdio: 'inherit'
  });

  const { sqlite } = createDatabase();
  ensureFsrsParamsSeeded(sqlite);
  return { sqlite };
}
