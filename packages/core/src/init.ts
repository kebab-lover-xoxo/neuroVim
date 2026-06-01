import { execSync } from 'child_process';
import { createDatabase, ensureFsrsParamsSeeded } from './db';

export function initializeDatabase() {
  execSync('pnpm exec drizzle-kit migrate --config drizzle.config.ts', {
    cwd: process.cwd(),
    stdio: 'inherit'
  });

  const { sqlite } = createDatabase();
  ensureFsrsParamsSeeded(sqlite);
  return { sqlite };
}
