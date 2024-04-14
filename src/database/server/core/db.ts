import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { getServerConfig } from '@/config/server';

import { schemas } from '../schemas';

const { POSTGRES_DATABASE_URL: connectionString } = getServerConfig();

if (!connectionString) {
  throw new Error('You are try to use database, but "POSTGRES_DATABASE_URL" is not set correctly');
}

const client = postgres(connectionString, { prepare: false });

export const serverDB = drizzle(client, { schema: schemas });
