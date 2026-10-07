<script lang="ts">
	import { resolve } from '$app/paths';
	import { telHref, type SiteExtras } from '@trailblazers/core';
	import { container, sectionY } from '../tb-layout.js';

	type FooterColumn = { title: string; links: { label: string; href: string }[] };

	let { columns, extras }: { columns: FooterColumn[]; extras: SiteExtras } = $props();

	const givingHref = $derived(extras.givingUrl?.trim() ? extras.givingUrl : '/give');
	const watchHref = $derived(extras.watchUrl?.trim() ? extras.watchUrl : '/watch');
	const messagesHref = $derived(extras.messagesUrl?.trim() ? extras.messagesUrl : '/messages');
	const phoneHref = $derived(telHref(extras.contactPhone));
	const socials = $derived(extras.socialLinks ?? []);
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- these hrefs come from the CMS / site settings and may be absolute external URLs, which resolve() cannot take -->

<footer class="border-t border-white/10 bg-brand-dark text-gray-300">
	<div class="{container} {sectionY} pb-12 pt-14 lg:pb-16 lg:pt-20">
		<div class="grid gap-12 lg:grid-cols-12 lg:gap-10">
			<div class="lg:col-span-4">
				<p class="font-sans text-xl font-black tracking-tight text-white lg:text-2xl">
					<span class="text-brand-gold">Trail</span><span class="text-white">blazers</span>
				</p>
				<p class="mt-4 max-w-sm text-sm leading-relaxed text-gray-400">
					A transformational leadership ecosystem for young adults — worship, community, and growth.
				</p>

				<!--
					Contact details, from site settings. The site previously carried no
					phone number, email or address on any page, so anyone who wanted to
					speak to a person had only the contact form.
				-->
				{#if extras.postalAddress || phoneHref || extras.contactEmail || extras.officeHours}
					<address class="mt-6 space-y-1.5 text-sm not-italic text-gray-400">
						{#if extras.postalAddress}
							<p class="max-w-sm">{extras.postalAddress}</p>
						{/if}
						{#if phoneHref}
							<p>
								<a class="transition hover:text-white" href={phoneHref}>{extras.contactPhone}</a>
							</p>
						{/if}
						{#if extras.contactEmail}
							<p>
								<a class="transition hover:text-white" href={`mailto:${extras.contactEmail}`}
									>{extras.contactEmail}</a
								>
							</p>
						{/if}
						{#if extras.officeHours}
							<p class="text-gray-400/80">{extras.officeHours}</p>
						{/if}
					</address>
				{/if}

				{#if socials.length > 0}
					<ul class="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
						{#each socials as social (social.url)}
							<li>
								<a
									class="transition hover:text-white"
									href={social.url}
									target="_blank"
									rel="noopener noreferrer">{social.label}</a
								>
							</li>
						{/each}
					</ul>
				{/if}
				<form
					method="POST"
					action="/api/newsletter"
					class="mt-8 max-w-md"
				>
					<p class="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-gold">Stay connected</p>
					<p class="mt-2 text-sm text-gray-400">Get updates on events and opportunities.</p>
					<!--
						Decoy field: hidden from people and assistive tech, but filled in by
						form-spamming bots. The server drops any submission that carries it.
					-->
					<div class="hidden" aria-hidden="true">
						<label for="footer-newsletter-website">Leave this field empty</label>
						<input
							id="footer-newsletter-website"
							type="text"
							name="website"
							tabindex="-1"
							autocomplete="off"
						/>
					</div>
					<div class="mt-4 flex flex-col gap-3 sm:flex-row">
						<label class="sr-only" for="footer-newsletter-email">Email address</label>
						<input
							id="footer-newsletter-email"
							type="email"
							name="email"
							required
							autocomplete="email"
							placeholder="Your email"
							class="min-h-12 flex-1 rounded-full border border-white/20 bg-white/5 px-4 text-sm text-white placeholder:text-gray-500 outline-none ring-brand-gold/30 transition focus:border-brand-gold focus:ring-2"
						/>
						<button
							type="submit"
							class="min-h-12 shrink-0 rounded-full bg-brand-primary px-8 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-lg transition hover:brightness-105"
						>
							Subscribe
						</button>
					</div>
					<!--
						The consent wording is stored verbatim with each subscription.
						If you change it here, change NEWSLETTER_CONSENT_TEXT in
						packages/core/src/modules/inquiries/service.ts to match.
					-->
					<p class="mt-3 text-xs leading-relaxed text-gray-500">
						By subscribing you agree to receive email updates about Trailblazers events and
						opportunities. You can unsubscribe at any time using the link in every email.
					</p>
				</form>
			</div>
			<div class="grid gap-10 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-2">
				{#each columns as col (col.title)}
					<div>
						<h3 class="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-gold">{col.title}</h3>
						<ul class="mt-5 space-y-3 text-sm">
							{#each col.links as link (link.href)}
								<li>
									<a class="transition hover:text-white" href={link.href}>{link.label}</a>
								</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
			<div class="lg:col-span-3">
				<h3 class="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-gold">Join us</h3>
				<ul class="mt-5 space-y-3 text-sm">
					<li><a class="transition hover:text-white" href={resolve('/plan-a-visit')}>Plan a visit</a></li>
					<li><a class="transition hover:text-white" href={watchHref}>Watch</a></li>
					<li><a class="transition hover:text-white" href={messagesHref}>Messages</a></li>
					<li><a class="transition hover:text-white" href={givingHref}>Give</a></li>
					<li><a class="transition hover:text-white" href={resolve('/contact')}>Contact</a></li>
				</ul>
			</div>
		</div>
	</div>
	<div class="border-t border-white/10">
		<div
			class="{container} flex flex-col items-center justify-between gap-4 py-6 text-center text-xs text-gray-500 sm:flex-row sm:text-left"
		>
			<p>
				© {new Date().getFullYear()}
				{extras.organizationName ?? 'Trailblazers'}. All rights reserved.
			</p>
			<div class="flex flex-wrap justify-center gap-6 sm:justify-end">
				<a class="transition hover:text-gray-300" href={resolve('/contact')}>Contact</a>
				<a class="transition hover:text-gray-300" href={resolve('/events')}>Events</a>
				<a class="transition hover:text-gray-300" href={resolve('/watch')}>Watch</a>
				<a class="transition hover:text-gray-300" href="https://trailblazersadmin.vercel.app/login">Staff portal</a>
			</div>
		</div>
	</div>
</footer>
