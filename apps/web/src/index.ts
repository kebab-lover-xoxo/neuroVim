import express, { Request, Response } from 'express';
import { getWelcomeMessage, setupCore } from '@mnemo/core';

export function createApp() {
  setupCore();
  const app = express();
  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) => {
    const status = getWelcomeMessage();
    res.json({ status: 'ok', data: status });
  });

  app.get('/info', (_req: Request, res: Response) => {
    res.json({ application: 'mnemo-web', uptime: process.uptime() });
  });

  return app;
}
