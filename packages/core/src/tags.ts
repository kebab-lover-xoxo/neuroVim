import Database from 'better-sqlite3';
import { nanoid } from 'nanoid';
import { z } from 'zod';

type Sqlite = any;

export const CreateTagInput = z.object({
  name: z.string().min(1).regex(/^[A-Za-z0-9-]+$/, 'name must be alphanumeric or hyphens'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'color must be a valid hex code')
});

export const AttachTagInput = z.object({
  tag_id: z.string().min(1)
});

export type CreateTagInput = z.infer<typeof CreateTagInput>;
export type AttachTagInput = z.infer<typeof AttachTagInput>;

export function insert_tag(sqlite: Sqlite, input: unknown) {
  const parsed = CreateTagInput.parse(input);
  const existing = sqlite.prepare('SELECT id FROM tags WHERE name = ?').get(parsed.name);
  if (existing) throw { status: 409, message: 'tag name already exists' };

  const id = nanoid();
  const now = new Date().toISOString();
  sqlite.prepare('INSERT INTO tags (id, name, color, created_at) VALUES (?, ?, ?, ?)').run(id, parsed.name, parsed.color, now);
  return sqlite.prepare('SELECT id, name, color, created_at FROM tags WHERE id = ?').get(id);
}

export function list_tags(sqlite: Sqlite) {
  return sqlite.prepare('SELECT id, name, color, created_at FROM tags ORDER BY name').all();
}

export function attach_tag(sqlite: Sqlite, note_id: string, input: unknown) {
  const parsed = AttachTagInput.parse(input);
  const note = sqlite.prepare('SELECT id FROM notes WHERE id = ?').get(note_id);
  if (!note) throw { status: 404, message: 'note not found' };

  const tag = sqlite.prepare('SELECT id FROM tags WHERE id = ?').get(parsed.tag_id);
  if (!tag) throw { status: 400, message: 'tag_id not found' };

  const existing = sqlite.prepare('SELECT 1 FROM note_tags WHERE note_id = ? AND tag_id = ?').get(note_id, parsed.tag_id);
  if (existing) throw { status: 409, message: 'tag already attached to note' };

  sqlite.prepare('INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)').run(note_id, parsed.tag_id);
  return { note_id, tag_id: parsed.tag_id };
}

export function detach_tag(sqlite: Sqlite, note_id: string, tag_id: string) {
  const result = sqlite.prepare('DELETE FROM note_tags WHERE note_id = ? AND tag_id = ?').run(note_id, tag_id);
  if (result.changes === 0) throw { status: 404, message: 'tag association not found' };
  return { note_id, tag_id };
}
