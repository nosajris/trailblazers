<script lang="ts">
	import { campusesToText, givingMethodsToText, socialLinksToText } from '@trailblazers/core';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const extras = $derived(data.settings.siteExtras);

	/** Field-level messages, when the last save was rejected. */
	const fieldErrors = $derived((form as { errors?: Record<string, string> } | null)?.errors ?? {});
</script>

<div class="space-y-6 max-w-4xl">
	<div>
		<h1 class="text-2xl font-bold text-[var(--zinc-900)]">Site Settings & SEO Configuration</h1>
		<p class="text-sm text-[var(--zinc-500)]">Configure global organization details, platform links, media embeds, and SEO metadata.</p>
	</div>

	<form action="?/saveSettings" method="POST" class="admin-card p-8 space-y-8 bg-white">
		<!-- General Information -->
		<div class="space-y-4">
			<h2 class="text-base font-bold text-[var(--zinc-900)] border-b border-[var(--zinc-200)] pb-2">General Organization Details</h2>
			<div>
				<label for="admin-setting-org" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Organization Name</label>
				<input
					id="admin-setting-org"
					type="text"
					name="organizationName"
					value={data.settings.siteExtras.organizationName || 'Trailblazers Young Adults'}
					class="admin-input"
				/>
			</div>
		</div>

		<!-- Global URLs -->
		<div class="space-y-4">
			<h2 class="text-base font-bold text-[var(--zinc-900)] border-b border-[var(--zinc-200)] pb-2">Media & Platform Links</h2>
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label for="admin-setting-watch" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Live Stream / Watch Path</label>
					<input
						id="admin-setting-watch"
						type="text"
						name="watchUrl"
						value={data.settings.siteExtras.watchUrl || '/watch'}
						class="admin-input"
					/>
				</div>

				<div>
					<label for="admin-setting-giving" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Giving Portal URL / Path</label>
					<input
						id="admin-setting-giving"
						type="text"
						name="givingUrl"
						value={data.settings.siteExtras.givingUrl || '/give'}
						class="admin-input"
					/>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div>
					<label for="admin-setting-embed" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Watch Hero Embed URL (YouTube)</label>
					<input
						id="admin-setting-embed"
						type="text"
						name="watchEmbedUrl"
						value={data.settings.siteExtras.watchEmbedUrl || ''}
						placeholder="https://www.youtube.com/embed/..."
						class="admin-input"
					/>
				</div>

				<div>
					<label for="admin-setting-visit" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Plan a Visit Path</label>
					<input
						id="admin-setting-visit"
						type="text"
						name="planVisitHref"
						value={data.settings.siteExtras.planVisitHref || '/plan-a-visit'}
						class="admin-input"
					/>
				</div>
			</div>
		</div>

		<!-- First-visit details -->
		<div class="space-y-4">
			<div class="border-b border-[var(--zinc-200)] pb-2">
				<h2 class="text-base font-bold text-[var(--zinc-900)]">Plan a Visit Details</h2>
				<p class="text-xs text-[var(--zinc-500)]">
					Shown on the public Plan a Visit page. Leave a field empty to hide it.
				</p>
			</div>
			<div>
				<label for="admin-setting-visit-times" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Gathering Times (one per line)</label>
				<textarea
					id="admin-setting-visit-times"
					name="visitTimes"
					rows="4"
					placeholder="One gathering per line, for example: Day, time and place"
					class="admin-input">{(extras.visitTimes ?? []).join('\n')}</textarea>
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label for="admin-setting-visit-address" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Address</label>
					<input
						id="admin-setting-visit-address"
						type="text"
						name="visitAddress"
						value={extras.visitAddress ?? ''}
						class="admin-input"
					/>
				</div>
				<div>
					<label for="admin-setting-visit-map" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Map Link (https://)</label>
					<input
						id="admin-setting-visit-map"
						type="text"
						name="visitMapUrl"
						value={extras.visitMapUrl ?? ''}
						placeholder="https://maps.google.com/..."
						class="admin-input"
					/>
				</div>
			</div>
			<div>
				<label for="admin-setting-visit-notes" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Good to Know (parking, what to wear, who to ask for)</label>
				<textarea
					id="admin-setting-visit-notes"
					name="visitNotes"
					rows="3"
					class="admin-input">{extras.visitNotes ?? ''}</textarea>
			</div>
		</div>

		<!-- Contact details -->
		<div class="space-y-4">
			<div class="border-b border-[var(--zinc-200)] pb-2">
				<h2 class="text-base font-bold text-[var(--zinc-900)]">Contact Details</h2>
				<p class="text-xs text-[var(--zinc-500)]">
					Shown in the footer and on the public Contact page. Until a phone number and email are
					saved here, the only way to reach the church is the contact form.
				</p>
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label for="admin-setting-phone" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Phone Number</label>
					<input
						id="admin-setting-phone"
						type="text"
						name="contactPhone"
						value={extras.contactPhone ?? ''}
						placeholder="+263 77 123 4567"
						class="admin-input"
					/>
				</div>
				<div>
					<label for="admin-setting-email" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Email Address</label>
					<input
						id="admin-setting-email"
						type="email"
						name="contactEmail"
						value={extras.contactEmail ?? ''}
						placeholder="hello@example.org"
						class="admin-input"
					/>
					{#if fieldErrors.contactEmail}
						<p class="mt-1 text-xs font-semibold text-[var(--color-danger-fg)]">{fieldErrors.contactEmail}</p>
					{/if}
				</div>
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label for="admin-setting-postal" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Postal / Street Address</label>
					<input
						id="admin-setting-postal"
						type="text"
						name="postalAddress"
						value={extras.postalAddress ?? ''}
						class="admin-input"
					/>
				</div>
				<div>
					<label for="admin-setting-hours" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Office Hours</label>
					<input
						id="admin-setting-hours"
						type="text"
						name="officeHours"
						value={extras.officeHours ?? ''}
						placeholder="Mon to Fri, 09:00 to 16:00"
						class="admin-input"
					/>
				</div>
			</div>
			<div>
				<label for="admin-setting-social" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Social Links (one per line)</label>
				<textarea
					id="admin-setting-social"
					name="socialLinks"
					rows="3"
					placeholder="Facebook | https://facebook.com/yourpage"
					class="admin-input">{socialLinksToText(extras.socialLinks)}</textarea>
				{#if fieldErrors.socialLinks}
					<p class="mt-1 text-xs font-semibold text-[var(--color-danger-fg)]">{fieldErrors.socialLinks}</p>
				{/if}
			</div>
		</div>

		<!-- Contact channels -->
		<div class="space-y-4">
			<div class="border-b border-[var(--zinc-200)] pb-2">
				<h2 class="text-base font-bold text-[var(--zinc-900)]">WhatsApp</h2>
				<p class="text-xs text-[var(--zinc-500)]">
					Adds a chat button to every public page. Leave the number empty to hide it.
				</p>
			</div>
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label for="admin-setting-whatsapp" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">WhatsApp Number (international)</label>
					<input
						id="admin-setting-whatsapp"
						type="text"
						name="whatsappNumber"
						value={extras.whatsappNumber ?? ''}
						placeholder="+263771234567"
						class="admin-input"
					/>
					{#if fieldErrors.whatsappNumber}
						<p class="mt-1 text-xs font-semibold text-[var(--color-danger-fg)]">{fieldErrors.whatsappNumber}</p>
					{/if}
				</div>
				<div>
					<label for="admin-setting-whatsapp-greeting" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Prefilled First Message</label>
					<input
						id="admin-setting-whatsapp-greeting"
						type="text"
						name="whatsappGreeting"
						value={extras.whatsappGreeting ?? ''}
						placeholder="Hello! I have a question about Trailblazers."
						class="admin-input"
					/>
				</div>
			</div>
		</div>

		<!-- Giving -->
		<div class="space-y-4">
			<div class="border-b border-[var(--zinc-200)] pb-2">
				<h2 class="text-base font-bold text-[var(--zinc-900)]">Giving Details</h2>
				<p class="text-xs text-[var(--zinc-500)]">
					Shown on the public Give page. One way to give per line, as
					<code>Name | Detail | Note</code> — the note is optional. Anything here is public.
				</p>
			</div>
			<div>
				<label for="admin-setting-giving-methods" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Ways to Give (one per line)</label>
				<textarea
					id="admin-setting-giving-methods"
					name="givingMethods"
					rows="4"
					placeholder="Bank transfer | CABS 1234567890, Harare branch | Use your name as the reference"
					class="admin-input">{givingMethodsToText(extras.givingMethods)}</textarea>
				{#if fieldErrors.givingMethods}
					<p class="mt-1 text-xs font-semibold text-[var(--color-danger-fg)]">{fieldErrors.givingMethods}</p>
				{/if}
			</div>
			<div>
				<label for="admin-setting-giving-note" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">What Giving Pays For</label>
				<textarea
					id="admin-setting-giving-note"
					name="givingNote"
					rows="3"
					class="admin-input">{extras.givingNote ?? ''}</textarea>
			</div>
		</div>

		<!-- Campuses -->
		<div class="space-y-4">
			<div class="border-b border-[var(--zinc-200)] pb-2">
				<h2 class="text-base font-bold text-[var(--zinc-900)]">Campuses</h2>
				<p class="text-xs text-[var(--zinc-500)]">
					Each campus gets its own public page at <code>/campus/&lt;id&gt;</code> and a card on the
					homepage. One per line, as <code>id | Name | Times | Address | Map link</code>. Separate
					several times with a semicolon; everything after the name is optional.
				</p>
			</div>
			<div>
				<label for="admin-setting-campuses" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Campuses (one per line)</label>
				<textarea
					id="admin-setting-campuses"
					name="campuses"
					rows="4"
					placeholder="harare | Harare — Resurrection Center | Sundays 09:00; Sundays 11:00 | 1 Samora Machel Ave | https://maps.google.com/..."
					class="admin-input">{campusesToText(extras.campuses)}</textarea>
				{#if fieldErrors.campuses}
					<p class="mt-1 text-xs font-semibold text-[var(--color-danger-fg)]">{fieldErrors.campuses}</p>
				{/if}
			</div>
		</div>

		<!-- SEO Defaults -->
		<div class="space-y-4">
			<h2 class="text-base font-bold text-[var(--zinc-900)] border-b border-[var(--zinc-200)] pb-2">SEO & Social Meta Defaults</h2>
			<div>
				<label for="admin-setting-seo-title" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Default Site Meta Title</label>
				<input
					id="admin-setting-seo-title"
					type="text"
					name="seoTitle"
					value={data.settings.seoDefaults.title}
					class="admin-input"
				/>
			</div>

			<div>
				<label for="admin-setting-seo-desc" class="block text-xs font-semibold uppercase text-[var(--zinc-700)] mb-1">Default Meta Description</label>
				<textarea
					id="admin-setting-seo-desc"
					name="seoDescription"
					rows="3"
					class="admin-input"
				>{data.settings.seoDefaults.description}</textarea>
			</div>
		</div>

		{#if form?.error}
			<p class="text-sm font-semibold text-[var(--color-danger-fg)]" role="alert">{form.error}</p>
		{:else if form?.success}
			<p class="text-sm font-semibold text-[var(--color-success-fg)]" role="status">Settings saved.</p>
		{/if}

		<div class="pt-4 border-t border-[var(--zinc-200)] flex justify-end">
			<button type="submit" class="admin-btn-primary">
				Save Site Settings
			</button>
		</div>
	</form>
</div>

