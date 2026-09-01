/**
 * Input schemas for events.
 *
 * The module owns the shape of its own input, so a controller cannot invent a
 * looser version. This is the reference for the other modules to copy: define
 * the schema here, import it in the route, and let `handleAction` apply it.
 */

import { z } from 'zod';
import {
	checkbox,
	date,
	id,
	oneOf,
	optionalId,
	optionalText,
	optionalUrl,
	requiredText
} from '../../util/form.js';

export const EVENT_TYPES = ['CAMP', 'WORKSHOP', 'MEETUP'] as const;
export const EVENT_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;

export const saveEventSchema = z.object({
	id: optionalId('Event'),
	title: requiredText('Title', 200),
	description: optionalText(5000),
	location: requiredText('Location', 200),
	date: date('Event date'),
	type: oneOf(EVENT_TYPES, 'Event type').default('MEETUP'),
	status: oneOf(EVENT_STATUSES, 'Status').default('PUBLISHED'),
	imageUrl: optionalUrl('Image URL'),
	// Coerced rather than trusted: these arrive as strings and used to be
	// written straight through.
	price: z.coerce.number().int().min(0, 'Price cannot be negative').default(0),
	capacity: z.coerce.number().int().positive('Capacity must be at least 1').default(100),
	isFeatured: checkbox()
});

export const deleteEventSchema = z.object({
	id: id('Event')
});

export type SaveEventInput = z.infer<typeof saveEventSchema>;
export type DeleteEventInput = z.infer<typeof deleteEventSchema>;
