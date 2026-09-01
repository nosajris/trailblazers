/**
 * English message catalogue — the source of truth.
 *
 * Every key must exist here. The other locales fall back to this one, so an
 * untranslated site reads as complete English rather than showing gaps.
 *
 * Keys are namespaced by area (`nav.`, `events.`) so a translator can work
 * through one section at a time.
 */

import type { Messages } from '../util/i18n.js';

export const en: Messages = {
	'nav.skipToContent': 'Skip to main content',
	'nav.planVisit': 'Plan a visit',
	'nav.language': 'Language',

	'common.submit': 'Send',
	'common.cancel': 'Cancel',
	'common.required': 'This field is required',
	'common.somethingWentWrong': 'Something went wrong. Please try again.',
	'common.tooManySubmissions': 'Too many submissions. Please try again shortly.',

	'events.register': 'Register',
	'events.joinWaitlist': 'Join the waitlist',
	'events.registered': 'You are registered',
	'events.waitlisted': 'You are on the waitlist',
	'events.full': 'This event is full. You can still join the waitlist below.',
	'events.closed': 'Registration for this event has closed.',
	'events.placesRemaining': '{count} places remaining',
	'events.downloadCalendar': 'Download calendar (.ics)',

	'groups.join': "I'd like to join",
	'groups.thanks': 'Thank you — we have your details',
	'groups.leaderWillContact': 'The group leader will be in touch about joining {group}.',

	'prayer.title': 'Let us pray with you',
	'prayer.intro':
		'Whatever you are carrying, you do not have to carry it alone. Share as much or as little as you want to.',
	'prayer.yourRequest': 'Your request',
	'prayer.privateByDefault':
		'Your request is private by default. Only the pastoral team can see it.',
	'prayer.allowSharing': 'You may share this with the wider prayer team.',
	'prayer.anonymous': 'Submit anonymously — do not store my name with this request.',
	'prayer.received': 'Thank you — we have your request.',

	'newsletter.heading': 'Stay connected',
	'newsletter.subscribe': 'Subscribe',
	'newsletter.consent':
		'By subscribing you agree to receive email updates about Trailblazers events and opportunities. You can unsubscribe at any time using the link in every email.',

	'error.notFound': 'We could not find that page',
	'error.serverError': 'Something went wrong on our end',
	'error.backHome': 'Back to the homepage',
	'error.offline': 'No connection right now'
};
