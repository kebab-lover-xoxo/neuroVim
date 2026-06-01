import type { Config } from 'drizzle-kit';

const config: Config = {
  schema: ['./drizzle/schema.ts'],
  out: './drizzle/migrations',
  driver: 'better-sqlite3',
  dbCredentials: {
    connectionString: 'sqlite:./data/mnemo.db'
  }
};

export default config;
