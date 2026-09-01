/** Input schemas for public event registration and group interest. */

import { z } from 'zod';
import { email, id, optionalPhone, optionalText, requiredText } from '../../util/form.js';

export const registerForEventSchema = z.object({
	eventId: id('Event'),
	fullName: requiredText('Your name', 120),
	email: email(),
	phone: optionalPhone(),
	notes: optionalText(500)
});

export const joinGroupSchema = z.object({
	groupId: id('Group'),
	fullName: requiredText('Your name', 120),
	email: email(),
	phone: optionalPhone(),
	message: optionalText(500)
});

export type RegisterForEventInput = z.infer<typeof registerForEventSchema>;
export type JoinGroupInput = z.infer<typeof joinGroupSchema>;
