<script lang="ts">
	import { resolve } from '$app/paths';
	import SiteShell from '@trailblazers/ui/site/site-shell.svelte';
	import SeoMeta from '@trailblazers/ui/site/seo-meta.svelte';
	import { container } from '@trailblazers/ui/tb-layout';
	import { responsiveSrcset } from '@trailblazers/ui/site/responsive-images';

	let { data } = $props();

	const series = $derived(data.series);
	const messages = $derived(data.messages);

	const when = (date: Date | null) =>
		date
			? new Intl.DateTimeFormat('en-GB', {
					day: 'numeric',
					month: 'short',
					year: 'numeric',
					timeZone: 'Africa/Harare'
				}).format(new Date(date))
			: '';
</script>

<SeoMeta
	title={`${series.title} — Trailblazers`}
	description={series.description ??
		`${series.messageCount} messages in the ${series.title} series from Trailblazers.`}
	image={series.coverImageUrl ?? '/images/sermon2.jpg'}
/>

<SiteShell settings={data.settings}>
	<section class="relative hero-fill flex flex-col justify-center overflow-hidden bg-brand-dark py-16 text-white md:py-24">
		{#if series.coverImageUrl}
			<div class="absolute inset-0">
				<img
					src={series.coverImageUrl}
					srcset={responsiveSrcset(series.coverImageUrl)}
					alt=""
					class="h-full w-full object-cover opacity-30"
					sizes="100vw"
					fetchpriority="high"
					loading="eager"
					decoding="async"
				/>
				<div class="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/85 to-brand-dark/50"></div>
			</div>
		{/if}
		<div class="{container} relative max-w-4xl">
			<a
				class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-gold hover:underline"
				href={resolve('/messages')}>← All series</a
			>
			<h1 class="mt-4 font-sans text-4xl font-black tracking-tight md:text-6xl">{series.title}</h1>
			{#if series.description}
				<p class="mt-6 max-w-2xl text-lg leading-relaxed text-gray-200">{series.description}</p>
			{/if}
			<p class="mt-6 text-sm font-semibold text-white/70">
				{series.messageCount}
				{series.messageCount === 1 ? 'message' : 'messages'}
			</p>
		</div>
	</section>

	<section class="bg-brand-light py-14 md:py-20">
		<div class="{container} max-w-4xl">
			<ol class="space-y-4">
				{#each messages as message, i (message.id)}
					<li>
						<!-- eslint-disable svelte/no-navigation-without-resolve -- internal path built from the message slug -->
						<a
							href={message.watchHref}
							class="group flex items-center gap-5 rounded-2xl border border-neutral-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-primary hover:shadow-md md:p-5"
						>
							<span
								class="hidden h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-brand-dark sm:block"
								aria-hidden="true"
							>
								<img
									src={message.thumbnailUrl ?? '/images/sermon2.jpg'}
									alt=""
									class="h-full w-full object-cover opacity-90"
									loading="lazy"
								/>
							</span>
							<span class="min-w-0 flex-1">
								<span class="block text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary">
									Part {messages.length - i}
								</span>
								<span class="mt-1 block truncate font-sans text-lg font-bold text-brand-dark">
									{message.title}
								</span>
								<span class="mt-1 block text-sm text-brand-dark/65">
									{message.speaker}{#if message.publishedAt}<span class="text-brand-dark/40"> · </span>{when(
											message.publishedAt
										)}{/if}
								</span>
							</span>
							<span class="shrink-0 text-sm font-bold text-brand-primary" aria-hidden="true">→</span>
						</a>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					</li>
				{/each}
			</ol>
		</div>
	</section>
</SiteShell>
