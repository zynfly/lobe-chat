/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { integer, pgTable, text, varchar } from 'drizzle-orm/pg-core';

import { idGenerator } from '@/database/server/utils';

export const files = pgTable('files', {
  // id e.g. file_GX5ymaxL3d2
  id: varchar('id', { length: 16 }).primaryKey().default(idGenerator('files', 11)),

  createdAt: integer('created_at'),
  fileType: varchar('file_type', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  size: integer('size').notNull(),
  url: text('url').notNull(),

  metadata: text('metadata'),
});
