import { createDatabase } from '@trailblazers/core';

const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/trailblazers';
const { db, sql } = createDatabase(databaseUrl);

export { db, sql };
