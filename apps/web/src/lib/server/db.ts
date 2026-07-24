import { DATABASE_URL } from '$env/static/private';
import { createDatabase } from '@trailblazers/core';

const { db, sql } = createDatabase(DATABASE_URL);

export { db, sql };
