<script lang="ts">
	import SiteShell from '@trailblazers/ui/site/site-shell.svelte';
	import SeoMeta from '@trailblazers/ui/site/seo-meta.svelte';

	let { data, form } = $props();
</script>

<SeoMeta
	title="Prayer requests — Trailblazers"
	description="Share a prayer request with the Trailblazers team. Requests are private unless you choose otherwise."
	siteUrl={data.settings.siteExtras.siteUrl ?? ''}
/>

<SiteShell settings={data.settings}>
	<section class="border-b border-neutral-200/80 bg-brand-light py-16 md:py-24">
		<div class="mx-auto max-w-2xl px-4 md:px-6">
			<p class="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-primary">Prayer</p>
			<h1 class="mt-4 font-sans text-3xl font-black tracking-tight text-brand-dark md:text-4xl">
				Let us pray with you
			</h1>
			<p class="mt-5 text-lg leading-relaxed text-brand-dark/75">
				Whatever you are carrying, you do not have to carry it alone. Share as much or as little as
				you want to.
			</p>

			{#if form?.success}
				<div
					class="mt-8 rounded-xl border border-[var(--color-success-border)] bg-[var(--color-success-bg)] p-5"
				>
					<p class="font-bold text-[var(--color-success-fg)]">Thank you — we have your request.</p>
					<p class="mt-2 text-sm text-[var(--color-success-fg)]">
						Someone from the prayer team will be praying for you. If you left your contact details
						and asked for follow-up, we will be in touch.
					</p>
				</div>
			{:else}
				{#if form?.error}
					<div
						class="mt-8 rounded-xl border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] p-4 text-sm font-semibold text-[var(--color-danger-fg)]"
					>
						{form.error}
					</div>
				{/if}

				<form method="POST" action="?/submit" class="mt-8 space-y-6">
					<!-- Decoy field for bots; see rate-limit.ts. -->
					<div class="hidden" aria-hidden="true">
						<label for="prayer-website">Leave this field empty</label>
						<input id="prayer-website" type="text" name="website" tabindex="-1" autocomplete="off" />
					</div>

					<div>
						<label
							class="text-xs font-bold uppercase tracking-wide text-brand-dark/60"
							for="prayer-request"
						>
							Your request
						</label>
						<textarea
							id="prayer-request"
							name="request"
							required
							rows="6"
							maxlength="2000"
							class="mt-2 w-full resize-y rounded-xl border border-neutral-200 bg-white px-4 py-3.5 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
						></textarea>
					</div>

					<div class="grid gap-6 sm:grid-cols-2">
						<div>
							<label
								class="text-xs font-bold uppercase tracking-wide text-brand-dark/60"
								for="prayer-name"
							>
								Your name <span class="font-normal normal-case">(optional)</span>
							</label>
							<input
								id="prayer-name"
								name="fullName"
								class="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
							/>
						</div>
						<div>
							<label
								class="text-xs font-bold uppercase tracking-wide text-brand-dark/60"
								for="prayer-email"
							>
								Email <span class="font-normal normal-case">(optional)</span>
							</label>
							<input
								id="prayer-email"
								name="email"
								type="email"
								class="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
							/>
						</div>
					</div>

					<fieldset class="space-y-3 rounded-xl border border-neutral-200 bg-white p-5">
						<legend class="px-2 text-xs font-bold uppercase tracking-wide text-brand-dark/60">
							Privacy
						</legend>

						<p class="text-sm text-brand-dark/70">
							Your request is <strong>private by default</strong>. Only the pastoral team can see it.
						</p>

						<label class="flex items-start gap-3 text-sm text-brand-dark/80">
							<input type="checkbox" name="allowSharing" class="mt-1" />
							<span>
								You may share this with the wider prayer team. Even then, nothing is published
								publicly unless a staff member reviews it first.
							</span>
						</label>

						<label class="flex items-start gap-3 text-sm text-brand-dark/80">
							<input type="checkbox" name="isAnonymous" class="mt-1" />
							<span>Submit anonymously — do not store my name with this request.</span>
						</label>
					</fieldset>

					<button
						type="submit"
						class="rounded-full bg-brand-primary px-10 py-4 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-md transition hover:brightness-105"
					>
						Send request
					</button>
				</form>
			{/if}
		</div>
	</section>

	{#if data.wall.length > 0}
		<section class="py-16 md:py-20">
			<div class="mx-auto max-w-3xl px-4 md:px-6">
				<h2 class="font-sans text-2xl font-black text-brand-dark md:text-3xl">
					Pray with the community
				</h2>
				<p class="mt-3 text-brand-dark/70">
					Requests shared with permission. Please hold these in prayer this week.
				</p>

				<ul class="mt-8 space-y-4">
					{#each data.wall as entry (entry.id)}
						<li class="rounded-xl border border-neutral-200 bg-white p-5">
							<p class="leading-relaxed text-brand-dark/85">{entry.request}</p>
							<p class="mt-3 text-xs font-bold uppercase tracking-wide text-brand-dark/70">
								{entry.name}
							</p>
						</li>
					{/each}
				</ul>
			</div>
		</section>
	{/if}
</SiteShell>
