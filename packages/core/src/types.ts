import { z } from 'zod';

export const CreateNoteInput = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  category: z.enum(['vocab', 'thinking', 'complex']).optional().default('vocab'),
  topic_id: z.string().optional().nullable()
});

export const UpdateNoteInput = z.object({
  title: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  summary: z.string().optional().nullable(),
  category: z.enum(['vocab', 'thinking', 'complex']).optional(),
  topic_id: z.string().optional().nullable()
});

export const CreateTopicInput = z.object({
  name: z.string().min(1),
  parent_id: z.string().optional().nullable(),
  depth: z.number().int().min(0).max(2)
});

export const CreateTagInput = z.object({
  name: z.string().min(1).regex(/^[A-Za-z0-9-]+$/, 'name must be alphanumeric or hyphens'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'color must be a valid hex code')
});

export const CreateNoteLinkInput = z.object({
  target_id: z.string().min(1),
  label: z.string().min(1)
});

export type CreateNoteInput = z.infer<typeof CreateNoteInput>;
export type UpdateNoteInput = z.infer<typeof UpdateNoteInput>;
export type CreateTopicInput = z.infer<typeof CreateTopicInput>;
export type CreateTagInput = z.infer<typeof CreateTagInput>;
export type CreateNoteLinkInput = z.infer<typeof CreateNoteLinkInput>;
