import { db } from '$lib/server/db';
import { groups } from '$lib/server/db/schema';

export const load = async () => {
	const allGroups = await db.select().from(groups);
	return { groups: allGroups };
};