<script lang="ts">
	import type { HomeContactVm } from '@trailblazers/core';
	import { container, sectionY, headline, eyebrow } from '../tb-layout.js';

	let { data }: { data: HomeContactVm } = $props();
</script>

<section class="border-b border-neutral-200/80 bg-[#f3f2ef] {sectionY}">
	<div class="{container}">
		<div class="mx-auto max-w-xl lg:mx-0 lg:max-w-none lg:grid lg:grid-cols-12 lg:gap-14 xl:gap-20">
			<div class="lg:col-span-5">
				<p class={eyebrow}>Reach out</p>
				<h2 class="mt-3 {headline}">
					{data.title ?? 'Contact'}
				</h2>
				{#if data.intro}
					<p class="mt-4 text-lg leading-relaxed text-brand-dark/75 md:text-xl">{data.intro}</p>
				{/if}
			</div>
			<div class="mt-10 lg:col-span-7 lg:mt-0">
				<form
					method="POST"
					action="/contact"
					class="rounded-3xl border border-neutral-200/90 bg-white p-6 shadow-xl ring-1 ring-black/[0.03] sm:p-8 md:p-10"
				>
					<div class="space-y-5">
						<div>
							<label class="text-xs font-bold uppercase tracking-wide text-brand-dark/60" for="contact-name"
								>Name</label
							>
							<input
								id="contact-name"
								name="name"
								required
								class="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-brand-dark outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
							/>
						</div>
						<div>
							<label class="text-xs font-bold uppercase tracking-wide text-brand-dark/60" for="contact-email"
								>Email</label
							>
							<input
								id="contact-email"
								name="email"
								type="email"
								required
								class="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-brand-dark outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
							/>
						</div>
						<div>
							<label
								class="text-xs font-bold uppercase tracking-wide text-brand-dark/60"
								for="contact-message">Message</label
							>
							<textarea
								id="contact-message"
								name="message"
								required
								rows="5"
								class="mt-2 w-full resize-y rounded-xl border border-neutral-200 bg-white px-4 py-3.5 text-brand-dark outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
							></textarea>
						</div>
						<button
							type="submit"
							class="btn btn-primary w-full rounded-full py-4 text-xs font-bold uppercase tracking-[0.14em] md:w-auto md:px-12"
						>
							Send message
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</section>
