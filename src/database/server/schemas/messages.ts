/* eslint-disable sort-keys-fix/sort-keys-fix  */
import { boolean, jsonb, pgTable, text, varchar } from 'drizzle-orm/pg-core';

import { idGenerator } from '@/database/server/utils';

import { files } from './files';
import { sessions } from './sessions';
import { topics } from './topics';

// @ts-ignore
export const messages = pgTable('messages', {
  // If I have 100 million users, each generating up to 1 million messages.
  // Then the total number of IDs that need to be generated: 100 million × 1 million = 10^14 (100 trillion)
  // 11-digit Nano ID: 36^11 ≈ 1.3 × 10^17 (130 trillion trillion)

  // id e.g. msg_GX5ymaxL3d2
  // refs: https://unkey.dev/blog/uuid-ux
  id: varchar('id', { length: 15 }).primaryKey().default(idGenerator('messages', 11)),

  role: varchar('role', { enum: ['user', 'system', 'assistant', 'function', 'tool'] }).notNull(),
  content: text('content'),

  fromModel: varchar('model'),
  fromProvider: varchar('provider'),

  favorite: boolean('favorite'),
  error: jsonb('error'),

  files: varchar('files', { length: 16 })
    .array()
    .references(() => files.id),

  pluginType: varchar('plugin_type', {
    enum: ['default', 'markdown', 'standalone', 'builtin'],
  }).default('default'),
  pluginApiName: varchar('plugin_api_name'),
  pluginArguments: varchar('plugin_arguments'),
  pluginIdentifier: varchar('plugin_identifier'),
  pluginState: jsonb('plugin_state'),

  translateContent: text('translate_content'),
  translateFrom: varchar('translate_from'),
  translateTo: varchar('translate_to'),
  tts: jsonb('tts'),

  traceId: varchar('trace_id'),
  observationId: varchar('observation_id'),

  // foreign keys
  sessionId: varchar('session_id')
    .references(() => sessions.id)
    .notNull(),
  topicId: varchar('topic_id').references(() => topics.id),
  parentId: varchar('parent_id').references(() => messages.id),
  quotaId: varchar('quota_id').references(() => messages.id),
});
