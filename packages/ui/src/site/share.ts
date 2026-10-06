/** Link that opens WhatsApp with `text` ready to send. Nothing is sent until the person taps send. */
export function whatsappShareUrl(text: string): string {
	return `https://wa.me/?text=${encodeURIComponent(text.trim())}`;
}
