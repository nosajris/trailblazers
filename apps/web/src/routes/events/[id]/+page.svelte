<script lang="ts">
	import SeoMeta from '@trailblazers/ui/site/seo-meta.svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import SiteShell from '@trailblazers/ui/site/site-shell.svelte';
	import { eventReminderText, whatsappShareUrl } from '@trailblazers/ui/site/share';

	let { data, form } = $props();

	// SvelteKit reuses this component when only the [id] parameter changes, so a
	// plain `let { event } = data` kept showing the previous event.
	const event = $derived(data.event);

	/** Seat state for this event, or null when the event vanished mid-request. */
	const availability = $derived(data.availability);

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit'
		}).format(new Date(date));
	};

	const shareHref = $derived(
		whatsappShareUrl(`${event.title} — ${formatDate(event.date)}, ${event.location}\n${page.url.href}`)
	);

	/**
	 * A reminder the person sends to themselves (or a friend) in WhatsApp.
	 *
	 * Sending real reminders would need a messaging provider and consent
	 * records; this needs neither, and most of this audience lives in WhatsApp
	 * rather than in a calendar app.
	 */
	const reminderHref = $derived(
		whatsappShareUrl(
			eventReminderText(
				{ title: event.title, when: formatDate(event.date), where: event.location },
				page.url.href
			)
		)
	);

	/**
	 * Event data for search engines, so a camp can show its date, place and
	 * price directly in results rather than as a generic blue link.
	 */
	const eventJsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'Event',
		name: event.title,
		description: event.description,
		startDate: new Date(event.date).toISOString(),
		eventStatus: 'https://schema.org/EventScheduled',
		eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
		location: { '@type': 'Place', name: event.location, address: event.location },
		...(event.imageUrl ? { image: event.imageUrl } : {}),
		organizer: { '@type': 'Organization', name: 'PAOZ Trailblazers' },
		offers: {
			'@type': 'Offer',
			price: ((event.price ?? 0) / 100).toFixed(2),
			priceCurrency: 'USD',
			url: page.url.href,
			availability:
				availability && !availability.isOpen
					? 'https://schema.org/SoldOut'
					: 'https://schema.org/InStock'
		}
	});

	const formatPrice = (cents: number) => {
		if (cents === 0) return 'Free';
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
	};
</script>

<SeoMeta
	title={`${event.title} — Trailblazers`}
	description={event.description.slice(0, 180)}
	image={event.imageUrl ?? '/images/wallpaper04.jpg'}
	jsonLd={eventJsonLd}
/>

<SiteShell settings={data.settings}>
	<div class="min-h-screen bg-brand-light pb-24">
		<div class="relative h-[50vh] w-full bg-brand-dark">
			<img
				src={event.imageUrl || '/images/wallpaper04.jpg'}
				alt={event.title}
				class="h-full w-full object-cover opacity-70"
				fetchpriority="high"
				loading="eager"
				decoding="async"
			/>
			<div class="absolute inset-0 bg-gradient-to-t from-brand-light to-transparent"></div>

			<div class="container absolute bottom-0 left-0 w-full max-w-5xl p-6 md:p-12 mx-auto">
				<span
					class="mb-4 inline-block rounded-full bg-brand-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-white"
				>
					{event.type}
				</span>
				<h1 class="mb-2 font-serif text-4xl font-bold text-brand-dark md:text-6xl">{event.title}</h1>
			</div>
		</div>

		<div class="container relative z-10 mx-auto -mt-8 max-w-5xl px-6">
			<div class="grid gap-8 md:grid-cols-3">
				<div class="space-y-8 md:col-span-2">
					<div class="rounded-lg bg-white p-8 shadow-sm">
						<h2 class="mb-4 font-serif text-2xl font-bold">About This Event</h2>
						<p class="whitespace-pre-line text-lg leading-relaxed text-gray-700">{event.description}</p>
					</div>
				</div>

				<div class="space-y-6">
					<div class="rounded-lg border-t-4 border-brand-primary bg-white p-6 shadow-lg">
						<h3 class="mb-6 text-xl font-bold">Event Details</h3>

						<div class="space-y-4">
							<div class="flex items-start gap-3">
								<div class="rounded bg-brand-light p-2 text-brand-primary">
									<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
										><path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
										></path></svg
									>
								</div>
								<div>
									<p class="text-xs font-bold uppercase text-gray-500">Date & Time</p>
									<p class="font-medium">{formatDate(event.date)}</p>
								</div>
							</div>

							<div class="flex items-start gap-3">
								<div class="rounded bg-brand-light p-2 text-brand-primary">
									<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
										><path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
										></path><path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
										></path></svg
									>
								</div>
								<div>
									<p class="text-xs font-bold uppercase text-gray-500">Location</p>
									<p class="font-medium">{event.location}</p>
								</div>
							</div>

							<div class="flex items-start gap-3">
								<div class="rounded bg-brand-light p-2 text-brand-primary">
									<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
										><path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										></path></svg
									>
								</div>
								<div>
									<p class="text-xs font-bold uppercase text-gray-500">Cost</p>
									<p class="font-medium">{formatPrice(event.price || 0)}</p>
								</div>
							</div>
						</div>

						<div class="mt-8 space-y-4">
							{#if form?.success}
								<div
									class="rounded-xl border border-[var(--color-success-border)] bg-[var(--color-success-bg)] p-4 text-sm"
								>
									{#if form.status === 'WAITLIST'}
										<p class="font-bold text-[var(--color-success-fg)]">You are on the waitlist</p>
										<p class="mt-1 text-[var(--color-success-fg)]">
											This event is full. We will email you if a place opens up.
										</p>
									{:else if form.alreadyRegistered}
										<p class="font-bold text-[var(--color-success-fg)]">You are already registered</p>
										<p class="mt-1 text-[var(--color-success-fg)]">
											We have you down for this one — no need to register again.
										</p>
									{:else}
										<p class="font-bold text-[var(--color-success-fg)]">You are registered</p>
										<p class="mt-1 text-[var(--color-success-fg)]">
											We have emailed you a confirmation. See you there.
										</p>
									{/if}
								</div>
							{:else if availability && !availability.isOpen}
								<p class="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-center text-sm text-gray-600">
									Registration for this event has closed.
								</p>
							{:else}
								{#if form?.error}
									<div
										class="rounded-xl border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-3 text-sm font-semibold text-[var(--color-danger-fg)]"
									>
										{form.error}
									</div>
								{/if}
								{#if availability?.willWaitlist}
									<p class="rounded-xl border border-[var(--color-warning-border)] bg-[var(--color-warning-bg)] p-3 text-xs text-[var(--color-warning-fg)]">
										This event is full. You can still join the waitlist below.
									</p>
								{/if}
								<form method="POST" action="?/register" class="space-y-3">
									<!-- Decoy field for bots; see rate-limit.ts. -->
									<div class="hidden" aria-hidden="true">
										<label for="rsvp-website">Leave this field empty</label>
										<input id="rsvp-website" type="text" name="website" tabindex="-1" autocomplete="off" />
									</div>
									<label class="sr-only" for="rsvp-name">Your name</label>
									<input
										id="rsvp-name"
										name="fullName"
										required
										placeholder="Your name"
										autocomplete="name"
										class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
									/>
									<label class="sr-only" for="rsvp-email">Email address</label>
									<input
										id="rsvp-email"
										name="email"
										type="email"
										required
										placeholder="Email address"
										autocomplete="email"
										class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
									/>
									<label class="sr-only" for="rsvp-phone">Phone number (optional)</label>
									<input
										id="rsvp-phone"
										name="phone"
										type="tel"
										placeholder="Phone number (optional)"
										autocomplete="tel"
										class="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
									/>
									<button type="submit" class="btn btn-primary flex w-full items-center justify-center py-3 text-center">
										{availability?.willWaitlist ? 'Join the waitlist' : 'Register'}
									</button>
								</form>
							{/if}
							<a
								class="block text-center text-sm font-semibold text-brand-primary underline-offset-2 hover:underline"
								href={resolve('/events/[id]/ics', { id: String(event.id) })}
								download>Download calendar (.ics)</a
							>
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external wa.me share link -->
							<a
								class="block text-center text-sm font-semibold text-brand-primary underline-offset-2 hover:underline"
								href={reminderHref}
								target="_blank"
								rel="noopener noreferrer">Remind me on WhatsApp</a
							>
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external wa.me share link -->
							<a
								class="block text-center text-sm font-semibold text-brand-primary underline-offset-2 hover:underline"
								href={shareHref}
								target="_blank"
								rel="noopener noreferrer">Share on WhatsApp</a
							>
							{#if availability && availability.seatsLeft !== null}
								<p class="text-center text-xs text-gray-500">
									{availability.seatsLeft}
									{availability.seatsLeft === 1 ? 'place' : 'places'} remaining
								</p>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</SiteShell>
