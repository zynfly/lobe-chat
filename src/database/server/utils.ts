import { sql } from 'drizzle-orm';

import { createNanoId } from '@/utils/uuid';

const prefixes = {
  files: 'file',
  messages: 'msg',
  plugins: 'plg',
  sessionGroups: 'sg',
  sessions: 'ssn',
  topics: 'tpc',
  user: 'user',
} as const;

export const idGenerator = (namespace: keyof typeof prefixes, size = 8) => {
  return sql`'${namespace}_' || ${createNanoId(size)}`;
};
