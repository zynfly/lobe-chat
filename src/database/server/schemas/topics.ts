/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { boolean, pgTable, varchar } from 'drizzle-orm/pg-core';

import { idGenerator } from '../utils';
import { sessions } from './sessions';

export const topics = pgTable('topics', {
  // tpc_GX5ymaxL3d7
  id: varchar('id', { length: 15 }).primaryKey().default(idGenerator('topics', 11)),
  sessionId: varchar('session_id')
    .references(() => sessions.id)
    .notNull(),

  favorite: boolean('favorite'),
  title: varchar('title'),
});
