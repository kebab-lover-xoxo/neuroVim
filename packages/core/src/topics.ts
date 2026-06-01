import Database from 'better-sqlite3';
import { nanoid } from 'nanoid';
import { CreateTopicInput as CreateTopicSchema } from './types';

type Sqlite = any;

function slugify(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
}

export function insert_topic(sqlite: Sqlite, input: unknown) {
  const parsed = CreateTopicSchema.parse(input);
  const { name, parent_id, depth } = parsed;
  if (depth < 0 || depth > 2) throw { status: 400, message: 'depth must be 0..2' };

  if (parent_id) {
    const parent = sqlite.prepare('SELECT id, depth FROM topics WHERE id = ?').get(parent_id);
    if (!parent) throw { status: 400, message: 'parent_id not found' };
    if (parent.depth + 1 !== depth) throw { status: 400, message: 'depth mismatch with parent' };
  }

  const slug = slugify(name);
  const exists = sqlite.prepare('SELECT COUNT(*) AS c FROM topics WHERE parent_id IS ? AND slug = ?').get(parent_id || null, slug);
  if (exists && exists.c > 0) throw { status: 409, message: 'duplicate slug in parent' };

  const id = nanoid();
  const now = new Date().toISOString();
  const stmt = sqlite.prepare('INSERT INTO topics (id, parent_id, depth, name, slug, position, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
  stmt.run(id, parent_id || null, depth, name, slug, 0, now);

  return sqlite.prepare('SELECT id, parent_id, depth, name, slug, position, created_at FROM topics WHERE id = ?').get(id);
}

export function get_topic_tree(sqlite: Sqlite) {
  const rows = sqlite.prepare('SELECT id, parent_id, depth, name, slug, position, created_at FROM topics ORDER BY created_at').all();
  const map: Record<string, any> = {};
  const roots: any[] = [];

  for (const r of rows) {
    map[r.id] = { ...r, children: [] };
  }

  for (const id in map) {
    const node = map[id];
    if (node.parent_id) {
      const parent = map[node.parent_id];
      if (parent) parent.children.push(node);
      else roots.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
