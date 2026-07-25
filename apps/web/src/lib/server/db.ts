import { env } from '$env/dynamic/private';
import { createDatabase } from '@trailblazers/core';

const databaseUrl = env.DATABASE_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/trailblazers';
const { db, sql } = createDatabase(databaseUrl);

export { db, sql };
