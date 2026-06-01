import express, { Request, Response } from 'express';
import { getWelcomeMessage, setupCore, notes as coreNotes, topics as coreTopics, tags as coreTags, note_links as coreLinks } from '@mnemo/core';

export function createApp() {
  const { sqlite } = setupCore();
  const app = express();
  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) => {
    const status = getWelcomeMessage();
    res.json({ status: 'ok', data: status });
  });

  app.get('/info', (_req: Request, res: Response) => {
    res.json({ application: 'mnemo-web', uptime: process.uptime() });
  });

  // Notes routes
  app.post('/notes', (req: Request, res: Response) => {
    try {
      const note = coreNotes.insert_note(sqlite, req.body);
      res.status(201).json(note);
    } catch (err: any) {
      if (err && err.status) return res.status(err.status).json({ error: err.message });
      if (err && err.name === 'ZodError') return res.status(400).json({ error: err.message });
      return res.status(500).json({ error: 'internal' });
    }
  });

  app.get('/notes', (req: Request, res: Response) => {
    const topic_id = typeof req.query.topic_id === 'string' ? req.query.topic_id : undefined;
    const tag = typeof req.query.tag === 'string' ? req.query.tag : undefined;
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const notes = coreNotes.list_notes(sqlite, { topic_id, tag, category });
    res.json(notes);
  });

  app.get('/notes/:id', (req: Request, res: Response) => {
    const note = coreNotes.get_note_detail(sqlite, req.params.id);
    if (!note) return res.status(404).json({ error: 'not found' });
    res.json(note);
  });

  app.patch('/notes/:id', (req: Request, res: Response) => {
    try {
      const note = coreNotes.update_note(sqlite, req.params.id, req.body);
      res.json(note);
    } catch (err: any) {
      if (err && err.status) return res.status(err.status).json({ error: err.message });
      if (err && err.name === 'ZodError') return res.status(400).json({ error: err.message });
      return res.status(500).json({ error: 'internal' });
    }
  });

  app.delete('/notes/:id', (req: Request, res: Response) => {
    try {
      coreNotes.delete_note(sqlite, req.params.id);
      res.status(204).send();
    } catch (err: any) {
      if (err && err.status) return res.status(err.status).json({ error: err.message });
      return res.status(500).json({ error: 'internal' });
    }
  });

  // Tag routes
  app.post('/tags', (req: Request, res: Response) => {
    try {
      const tag = coreTags.insert_tag(sqlite, req.body);
      res.status(201).json(tag);
    } catch (err: any) {
      if (err && err.status) return res.status(err.status).json({ error: err.message });
      if (err && err.name === 'ZodError') return res.status(400).json({ error: err.message });
      return res.status(500).json({ error: 'internal' });
    }
  });

  app.get('/tags', (_req: Request, res: Response) => {
    const tags = coreTags.list_tags(sqlite);
    res.json(tags);
  });

  app.post('/notes/:id/tags', (req: Request, res: Response) => {
    try {
      const attachment = coreTags.attach_tag(sqlite, req.params.id, req.body);
      res.status(201).json(attachment);
    } catch (err: any) {
      if (err && err.status) return res.status(err.status).json({ error: err.message });
      if (err && err.name === 'ZodError') return res.status(400).json({ error: err.message });
      return res.status(500).json({ error: 'internal' });
    }
  });

  app.delete('/notes/:id/tags/:tag_id', (req: Request, res: Response) => {
    try {
      coreTags.detach_tag(sqlite, req.params.id, req.params.tag_id);
      res.status(204).send();
    } catch (err: any) {
      if (err && err.status) return res.status(err.status).json({ error: err.message });
      return res.status(500).json({ error: 'internal' });
    }
  });

  // Link routes
  app.post('/notes/:id/links', (req: Request, res: Response) => {
    try {
      const link = coreLinks.insert_note_link(sqlite, req.params.id, req.body);
      res.status(201).json(link);
    } catch (err: any) {
      if (err && err.status) return res.status(err.status).json({ error: err.message });
      if (err && err.name === 'ZodError') return res.status(400).json({ error: err.message });
      return res.status(500).json({ error: 'internal' });
    }
  });

  app.get('/notes/:id/links', (req: Request, res: Response) => {
    try {
      const links = coreLinks.get_note_links(sqlite, req.params.id);
      res.json(links);
    } catch (err: any) {
      if (err && err.status) return res.status(err.status).json({ error: err.message });
      return res.status(500).json({ error: 'internal' });
    }
  });

  app.delete('/notes/:id/links/:target_id', (req: Request, res: Response) => {
    try {
      coreLinks.delete_note_link(sqlite, req.params.id, req.params.target_id);
      res.status(204).send();
    } catch (err: any) {
      if (err && err.status) return res.status(err.status).json({ error: err.message });
      return res.status(500).json({ error: 'internal' });
    }
  });

  // Topics routes
  app.post('/topics', (req: Request, res: Response) => {
    try {
      const topic = coreTopics.insert_topic(sqlite, req.body);
      res.status(201).json(topic);
    } catch (err: any) {
      if (err && err.status) return res.status(err.status).json({ error: err.message });
      if (err && err.name === 'ZodError') return res.status(400).json({ error: err.message });
      return res.status(500).json({ error: 'internal' });
    }
  });

  app.get('/topics', (_req: Request, res: Response) => {
    const tree = coreTopics.get_topic_tree(sqlite);
    res.json(tree);
  });

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'not found' });
  });

  return app;
}
