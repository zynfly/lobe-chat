/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { boolean, json, pgTable, varchar } from 'drizzle-orm/pg-core';

import { idGenerator } from '@/database/server/utils';

export const sessions = pgTable('sessions', {
  // id e.g. ssn_GX5ymaxL3d2d
  id: varchar('id', { length: 16 }).primaryKey().default(idGenerator('sessions', 12)),
  type: varchar('type', { enum: ['agent', 'group'] }).default('agent'),

  config: json('config'),
  group: varchar('group', { length: 255 }).default('default'),
  meta: json('meta'),
  pinned: boolean('pinned').default(false),
});
