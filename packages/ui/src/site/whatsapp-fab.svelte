<script lang="ts">
	import { page } from '$app/state';
	import { whatsappChatUrl } from './share.js';

	/**
	 * A floating "chat with us" button.
	 *
	 * Most of this audience would rather send a WhatsApp message than fill in a
	 * form, and the church already runs on WhatsApp. Nothing renders until a
	 * number is saved in site settings, so there is never a dead button, and
	 * nothing is sent until the person taps send in WhatsApp.
	 */
	let { number, greeting = '' }: { number?: string; greeting?: string } = $props();

	const href = $derived(
		whatsappChatUrl(number, greeting.trim() || `Hello! I have a question about ${page.url.host}.`)
	);
</script>

{#if href}
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external wa.me link built from the settings number -->
	<a
		{href}
		target="_blank"
		rel="noopener noreferrer"
		class="fixed bottom-20 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary text-white shadow-lg transition hover:brightness-105 focus-visible:ring-4 focus-visible:ring-brand-primary/30 md:bottom-6 md:right-6"
	>
		<span class="sr-only">Chat with us on WhatsApp</span>
		<svg class="h-7 w-7 fill-current" viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.8 14.03c-.24.68-1.4 1.3-1.93 1.35-.53.05-1.03.24-3.47-.72-2.94-1.16-4.78-4.22-4.92-4.42-.14-.2-1.16-1.55-1.16-2.95 0-1.4.73-2.09.99-2.38.26-.29.56-.36.75-.36.19 0 .38 0 .55.01.17.01.41-.07.64.49.24.56.8 1.96.87 2.1.07.14.12.31.02.5-.1.19-.19.31-.38.53-.19.22-.29.34-.19.53.1.19.46.76 1 1.23.69.61 1.26.8 1.45.9.19.1.3.08.41-.05.11-.13.48-.56.61-.75.13-.19.26-.16.44-.09.18.07 1.58.75 1.85.88.27.13.45.2.52.31.07.11.07.65-.17 1.33z"
			/>
		</svg>
	</a>
{/if}
