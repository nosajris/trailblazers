/** Link that opens WhatsApp with `text` ready to send. Nothing is sent until the person taps send. */
export function whatsappShareUrl(text: string): string {
	return `https://wa.me/?text=${encodeURIComponent(text.trim())}`;
}

/**
 * Link that opens a chat with one number, with `text` ready to send.
 *
 * `number` is the digits-only form held in site settings; an empty or
 * non-numeric value returns undefined so callers render nothing rather than a
 * link to a stranger's account.
 */
export function whatsappChatUrl(number: string | null | undefined, text = ''): string | undefined {
	const digits = (number ?? '').replace(/[^\d]/g, '');
	if (digits.length < 8 || digits.length > 15) return undefined;
	const query = text.trim() ? `?text=${encodeURIComponent(text.trim())}` : '';
	return `https://wa.me/${digits}${query}`;
}

/** The message body for "remind me about this event" — the person sends it to themselves. */
export function eventReminderText(event: { title: string; when: string; where?: string }, url: string): string {
	const where = event.where ? ` at ${event.where}` : '';
	return `Reminder: ${event.title} — ${event.when}${where}\n${url}`;
}
