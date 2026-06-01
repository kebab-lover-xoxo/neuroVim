import { json, sqliteTable, text, integer, real, timestamp, sql, index } from 'drizzle-orm/sqlite-core';

export const topics = sqliteTable('topics', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  depth: integer('depth').notNull().check(sql`depth BETWEEN 0 AND 2`),
  created_at: timestamp('created_at').notNull().defaultNow()
});

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow()
});

export const notes = sqliteTable('notes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  topic_id: text('topic_id').references(topics.id),
  created_at: timestamp('created_at').notNull().defaultNow()
});

export const note_tags = sqliteTable('note_tags', {
  note_id: text('note_id').notNull().references(notes.id, { onDelete: 'cascade' }),
  tag_id: text('tag_id').notNull().references(tags.id, { onDelete: 'cascade' })
}, {
  primaryKey: ["note_id", "tag_id"]
});

export const note_links = sqliteTable('note_links', {
  id: text('id').primaryKey(),
  source_note_id: text('source_note_id').notNull().references(notes.id, { onDelete: 'cascade' }),
  target_note_id: text('target_note_id').notNull().references(notes.id, { onDelete: 'cascade' }),
  relation: text('relation').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow()
});

export const media = sqliteTable('media', {
  id: text('id').primaryKey(),
  note_id: text('note_id').notNull().references(notes.id, { onDelete: 'cascade' }),
  media_type: text('media_type').notNull(),
  url: text('url').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow()
});

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  started_at: timestamp('started_at').notNull().defaultNow(),
  ended_at: timestamp('ended_at'),
  is_active: integer('is_active').notNull().default(1)
});

export const session_chunks = sqliteTable('session_chunks', {
  id: text('id').primaryKey(),
  session_id: text('session_id').notNull().references(sessions.id, { onDelete: 'cascade' }),
  chunk_type: text('chunk_type').notNull(),
  status: text('status').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  closed_at: timestamp('closed_at')
});

export const chunk_atoms = sqliteTable('chunk_atoms', {
  id: text('id').primaryKey(),
  session_chunk_id: text('session_chunk_id').notNull().references(session_chunks.id, { onDelete: 'cascade' }),
  note_id: text('note_id').notNull().references(notes.id, { onDelete: 'cascade' }),
  position: integer('position').notNull().default(0),
  content: text('content').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow()
});

export const chunk_buffers = sqliteTable('chunk_buffers', {
  id: text('id').primaryKey(),
  session_chunk_id: text('session_chunk_id').notNull().references(session_chunks.id, { onDelete: 'cascade' }),
  paused_at: timestamp('paused_at').notNull(),
  resumed_at: timestamp('resumed_at'),
  duration_ms: integer('duration_ms').notNull().default(0)
});

export const cards = sqliteTable('cards', {
  id: text('id').primaryKey(),
  session_chunk_id: text('session_chunk_id').notNull().references(session_chunks.id, { onDelete: 'cascade' }),
  stability: real('stability').notNull().default(0),
  difficulty: real('difficulty').notNull().default(0),
  due_at: timestamp('due_at').notNull().defaultNow(),
  elapsed_days: real('elapsed_days').notNull().default(0),
  scheduled_days: real('scheduled_days').notNull().default(0),
  reps: integer('reps').notNull().default(0),
  lapses: integer('lapses').notNull().default(0),
  state: text('state').notNull().default('new')
}, {
  indexes: [index('cards_due_idx').on('due_at').where(sql`state = 'due'`)]
});

export const reviews = sqliteTable('reviews', {
  id: text('id').primaryKey(),
  card_id: text('card_id').notNull().references(cards.id, { onDelete: 'cascade' }),
  session_id: text('session_id').notNull().references(sessions.id, { onDelete: 'cascade' }),
  rating: text('rating').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow()
});

export const fsrs_params = sqliteTable('fsrs_params', {
  id: text('id').primaryKey(),
  version: integer('version').notNull().default(1),
  active: integer('active').notNull().default(1),
  weights: json('weights').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow()
});
