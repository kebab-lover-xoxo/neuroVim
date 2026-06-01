import Database from 'better-sqlite3';
import { nanoid } from 'nanoid';
import { z } from 'zod';

type Sqlite = any;

export const CreateNoteLinkInput = z.object({
  target_id: z.string().min(1),
  label: z.string().min(1)
});

export type CreateNoteLinkInput = z.infer<typeof CreateNoteLinkInput>;

export function insert_note_link(sqlite: Sqlite, source_id: string, input: unknown) {
  const parsed = CreateNoteLinkInput.parse(input);

  if (parsed.target_id === source_id) {
    throw { status: 400, message: 'self-link is not allowed' };
  }

  const sourceNote = sqlite.prepare('SELECT id FROM notes WHERE id = ?').get(source_id);
  if (!sourceNote) throw { status: 404, message: 'source note not found' };

  const targetNote = sqlite.prepare('SELECT id FROM notes WHERE id = ?').get(parsed.target_id);
  if (!targetNote) throw { status: 400, message: 'target_id not found' };

  const existing = sqlite.prepare('SELECT 1 FROM note_links WHERE source_note_id = ? AND target_note_id = ?').get(source_id, parsed.target_id);
  if (existing) throw { status: 409, message: 'duplicate link' };

  const id = nanoid();
  const now = new Date().toISOString();
  sqlite.prepare('INSERT INTO note_links (id, source_note_id, target_note_id, relation, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(id, source_id, parsed.target_id, parsed.label, now);

  return sqlite.prepare('SELECT id, source_note_id, target_note_id, relation AS label, created_at FROM note_links WHERE id = ?').get(id);
}

export function get_note_links(sqlite: Sqlite, note_id: string) {
  const note = sqlite.prepare('SELECT id FROM notes WHERE id = ?').get(note_id);
  if (!note) throw { status: 404, message: 'note not found' };

  const outgoing = sqlite.prepare(
    `SELECT nl.relation AS label, n.id AS target_id, n.title, n.category
     FROM note_links nl
     JOIN notes n ON nl.target_note_id = n.id
     WHERE nl.source_note_id = ?`
  ).all(note_id);

  const incoming = sqlite.prepare(
    `SELECT nl.relation AS label, n.id AS target_id, n.title, n.category
     FROM note_links nl
     JOIN notes n ON nl.source_note_id = n.id
     WHERE nl.target_note_id = ?`
  ).all(note_id);

  return [
    ...outgoing.map((row: any) => ({ label: row.label, target: { id: row.target_id, title: row.title, category: row.category } })),
    ...incoming.map((row: any) => ({ label: row.label, target: { id: row.target_id, title: row.title, category: row.category } }))
  ];
}

export function delete_note_link(sqlite: Sqlite, source_id: string, target_id: string) {
  const result = sqlite.prepare(
    `DELETE FROM note_links
     WHERE (source_note_id = ? AND target_note_id = ?)
        OR (source_note_id = ? AND target_note_id = ?)`
  ).run(source_id, target_id, target_id, source_id);
  if (result.changes === 0) throw { status: 404, message: 'link not found' };
  return { source_id, target_id };
}
