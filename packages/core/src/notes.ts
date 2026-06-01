import { nanoid } from 'nanoid';

type Sqlite = any;
import { CreateNoteInput as CreateNoteSchema, UpdateNoteInput as UpdateNoteSchema } from './types';

export function insert_note(sqlite: Sqlite, input: unknown) {
  const parsed = CreateNoteSchema.parse(input);
  const { title, body, category, topic_id } = parsed;
  const id = nanoid();
  const now = new Date().toISOString();

  if (topic_id) {
    const topic = sqlite.prepare('SELECT id FROM topics WHERE id = ?').get(topic_id);
    if (!topic) throw { status: 400, message: 'topic_id not found' };
  }

  const stmt = sqlite.prepare(`INSERT INTO notes (id, title, body, topic_id, category, summary, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, NULL, ?, ?)`);
  stmt.run(id, title, body, topic_id || null, category || 'vocab', now, now);

  const row = sqlite.prepare('SELECT id, title, body, summary, category, topic_id, created_at, updated_at FROM notes WHERE id = ?').get(id);
  return row;
}

export function get_note(sqlite: Sqlite, id: string) {
  const row: any = sqlite.prepare('SELECT id, title, body, summary, category, topic_id, created_at, updated_at FROM notes WHERE id = ?').get(id);
  return row || null;
}

export function get_note_detail(sqlite: Sqlite, id: string) {
  const note = get_note(sqlite, id);
  if (!note) return null;

  const tags = sqlite.prepare(
    `SELECT t.id, t.name, t.color
     FROM tags t
     JOIN note_tags nt ON t.id = nt.tag_id
     WHERE nt.note_id = ?`
  ).all(id);

  const topic = note.topic_id
    ? sqlite.prepare('SELECT id, parent_id, depth, name, slug FROM topics WHERE id = ?').get(note.topic_id)
    : null;

  const outgoing = sqlite.prepare(
    `SELECT nl.relation AS label, n.id AS target_id, n.title, n.category
     FROM note_links nl
     JOIN notes n ON nl.target_note_id = n.id
     WHERE nl.source_note_id = ?`
  ).all(id);

  const incoming = sqlite.prepare(
    `SELECT nl.relation AS label, n.id AS target_id, n.title, n.category
     FROM note_links nl
     JOIN notes n ON nl.source_note_id = n.id
     WHERE nl.target_note_id = ?`
  ).all(id);

  const links = [
    ...outgoing.map((row: any) => ({ label: row.label, target: { id: row.target_id, title: row.title, category: row.category } })),
    ...incoming.map((row: any) => ({ label: row.label, target: { id: row.target_id, title: row.title, category: row.category } }))
  ];

  return { ...note, tags, topic, links };
}

export function list_notes(sqlite: Sqlite, filters: { topic_id?: string; tag?: string; category?: string } = {}) {
  const { topic_id, tag, category } = filters;
  const params: any[] = [];
  let sql = `SELECT DISTINCT n.id, n.title, n.body, n.summary, n.category, n.topic_id, n.created_at, n.updated_at
    FROM notes n`;

  if (tag) {
    sql += ' INNER JOIN note_tags nt ON n.id = nt.note_id INNER JOIN tags t ON nt.tag_id = t.id';
  }

  const conditions: string[] = [];
  if (topic_id !== undefined) {
    conditions.push('n.topic_id = ?');
    params.push(topic_id);
  }
  if (category !== undefined) {
    if (!['vocab', 'thinking', 'complex'].includes(category)) {
      throw { status: 400, message: 'invalid category' };
    }
    conditions.push('n.category = ?');
    params.push(category);
  }

  if (tag !== undefined) {
    conditions.push('t.name = ?');
    params.push(tag);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(' AND ')}`;
  }

  sql += ' ORDER BY n.created_at';
  return sqlite.prepare(sql).all(...params);
}

export function update_note(sqlite: Sqlite, id: string, input: unknown) {
  const parsed = UpdateNoteSchema.parse(input);
  const existing = sqlite.prepare('SELECT * FROM notes WHERE id = ?').get(id);
  if (!existing) throw { status: 404, message: 'note not found' };

  const fields: string[] = [];
  const values: any[] = [];

  if (parsed.title !== undefined) {
    fields.push('title = ?'); values.push(parsed.title);
  }
  if (parsed.body !== undefined) {
    fields.push('body = ?'); values.push(parsed.body);
  }
  if (parsed.summary !== undefined) {
    fields.push('summary = ?'); values.push(parsed.summary);
  }
  if (parsed.category !== undefined) {
    fields.push('category = ?'); values.push(parsed.category);
  }
  if (parsed.topic_id !== undefined) {
    if (parsed.topic_id !== null) {
      const topic = sqlite.prepare('SELECT id FROM topics WHERE id = ?').get(parsed.topic_id);
      if (!topic) throw { status: 400, message: 'topic_id not found' };
    }
    fields.push('topic_id = ?'); values.push(parsed.topic_id);
  }

  if (fields.length === 0) {
    return sqlite.prepare('SELECT id, title, body, summary, category, topic_id, created_at, updated_at FROM notes WHERE id = ?').get(id);
  }

  const now = new Date().toISOString();
  fields.push('updated_at = ?'); values.push(now);

  const sql = `UPDATE notes SET ${fields.join(', ')} WHERE id = ?`;
  values.push(id);
  sqlite.prepare(sql).run(...values);

  return sqlite.prepare('SELECT id, title, body, summary, category, topic_id, created_at, updated_at FROM notes WHERE id = ?').get(id);
}

export function delete_note(sqlite: Sqlite, id: string) {
  const result = sqlite.prepare('DELETE FROM notes WHERE id = ?').run(id);
  if (result.changes === 0) throw { status: 404, message: 'note not found' };
  return { id };
}
