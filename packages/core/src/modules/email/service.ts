/**
 * Transactional email.
 *
 * This was a stub that only wrote to the log, so nothing the site collected
 * ever reached anybody: contact messages, volunteer applications and visit
 * registrations all landed in the database and notified no one.
 *
 * It now sends through Resend over plain `fetch` — no SDK, so no dependency to
 * keep current. Without `RESEND_API_KEY` it falls back to logging, which keeps
 * local development and CI working and makes this safe to merge before the key
 * exists.
 *
 * Every message's HTML is built by `emailHtml` from the same plain text each
 * caller already writes — one calm branded card instead of each call site
 * hand-rolling its own `<p>` tags (or, for the office notification, dumping
 * raw text into a `<pre>`). A caller can still pass `html` explicitly to
 * override that, but nothing here needs to any more.
 */

import { logger } from '../../logger.js';
import { emailHtml, type EmailAction } from './html-template.js';

export type EmailConfig = {
	/** Resend API key. Absent means log-only mode. */
	apiKey: string | undefined;
	/** Verified sender, e.g. 'Trailblazers <hello@paoz.org>'. */
	from: string | undefined;
	/** Where staff notifications go. */
	officeAddress: string | undefined;
};

export type SendResult = {
	success: boolean;
	/** True when the message was logged rather than sent. */
	simulated: boolean;
	messageId?: string;
	error?: string;
};

export type EmailMessage = {
	to: string;
	subject: string;
	/** Plain text. Always provide it: some clients prefer it, and it is the accessible fallback. */
	text: string;
	/** A link to render as a button in the HTML version. Ignored if `html` is given explicitly. */
	action?: EmailAction;
	/** Overrides the HTML this module would otherwise build from `text`/`action`. */
	html?: string;
	replyTo?: string;
};

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export function createEmailService(config: EmailConfig = { apiKey: undefined, from: undefined, officeAddress: undefined }) {
	const enabled = Boolean(config.apiKey && config.from);

	/**
	 * Sends one message.
	 *
	 * Never throws: a failed notification must not fail the visitor's form
	 * submission. The caller gets a result and the failure is logged.
	 */
	async function send(message: EmailMessage): Promise<SendResult> {
		const html = message.html ?? emailHtml({ subject: message.subject, text: message.text, action: message.action });

		if (!enabled) {
			logger.info('EMAIL', 'simulated send (no RESEND_API_KEY configured)', {
				subject: message.subject
			});
			return { success: true, simulated: true, messageId: `simulated_${Date.now()}` };
		}

		try {
			const response = await fetch(RESEND_ENDPOINT, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${config.apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					from: config.from,
					to: [message.to],
					subject: message.subject,
					text: message.text,
					html,
					...(message.replyTo ? { reply_to: message.replyTo } : {})
				})
			});

			if (!response.ok) {
				// Log the status, not the body: provider errors can echo the
				// recipient address and other details back at us.
				logger.error('EMAIL', 'provider rejected the message', {
					status: response.status,
					subject: message.subject
				});
				return { success: false, simulated: false, error: `Provider returned ${response.status}` };
			}

			const body = (await response.json()) as { id?: string };
			logger.info('EMAIL', 'sent', { subject: message.subject });

			return { success: true, simulated: false, messageId: body.id };
		} catch (err) {
			logger.error('EMAIL', 'send failed', {
				message: err instanceof Error ? err.message : String(err)
			});
			return { success: false, simulated: false, error: 'Send failed' };
		}
	}

	return {
		send,
		isEnabled: () => enabled,

		async sendWelcomeEmail(toEmail: string, fullName: string) {
			return send({
				to: toEmail,
				subject: 'Welcome to Trailblazers',
				text:
					`Hi ${fullName},\n\n` +
					`Thanks for connecting with PAOZ Trailblazers. We are glad you are here.\n\n` +
					`If you have any questions, just reply to this email.\n\n` +
					`— The Trailblazers team`
			});
		},

		async sendVolunteerConfirmation(toEmail: string, fullName: string, team: string) {
			return send({
				to: toEmail,
				subject: `Your application to serve on ${team}`,
				text:
					`Hi ${fullName},\n\n` +
					`We have received your application to serve on the ${team} team. ` +
					`Someone from the team will be in touch soon.\n\n` +
					`— The Trailblazers team`
			});
		},

		/** Confirms a seat, or explains the waitlist. */
		async sendEventRegistration(
			toEmail: string,
			fullName: string,
			eventTitle: string,
			status: 'CONFIRMED' | 'WAITLIST'
		) {
			const confirmed = status === 'CONFIRMED';

			return send({
				to: toEmail,
				subject: confirmed
					? `You're registered for ${eventTitle}`
					: `You're on the waitlist for ${eventTitle}`,
				text:
					`Hi ${fullName},\n\n` +
					(confirmed
						? `Your place at ${eventTitle} is confirmed. We look forward to seeing you.`
						: `${eventTitle} is currently full, so we have added you to the waitlist. ` +
							`We will email you if a place opens up.`) +
					`\n\n— The Trailblazers team`
			});
		},

		/** The day-before nudge for someone registered for an event. */
		async sendEventReminder(
			toEmail: string,
			fullName: string,
			eventTitle: string,
			whenText: string,
			location: string
		) {
			return send({
				to: toEmail,
				subject: `Tomorrow: ${eventTitle}`,
				text:
					`Hi ${fullName},\n\n` +
					`Just a reminder that ${eventTitle} is coming up ${whenText} at ${location}. ` +
					`We are looking forward to seeing you there.\n\n— The Trailblazers team`
			});
		},

		/**
		 * Tells the office that someone submitted a form.
		 *
		 * Replies go to the visitor, so staff can answer without copying the
		 * address across by hand.
		 */
		async notifyOffice(subject: string, body: string, replyTo?: string) {
			if (!config.officeAddress) {
				logger.warn('EMAIL', 'no office address configured; notification skipped', { subject });
				return { success: false, simulated: true, error: 'No office address configured' };
			}

			return send({
				to: config.officeAddress,
				subject,
				text: body,
				replyTo
			});
		}
	};
}
