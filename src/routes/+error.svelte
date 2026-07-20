<script lang="ts">
	import { page } from '$app/state';

	const msg: Record<number, [string, string]> = {
		404: ['page not found', 'this product may have been removed or the link was mistyped.'],
		403: ['not your page', 'only the builder who submitted this product can edit it.'],
		400: [
			'sign-in expired',
			'the sign-in attempt timed out or was interrupted. it happens — just try again.'
		]
	};
	const [heading, detail] = $derived(msg[page.status] ?? ['something went wrong', 'try again in a moment.']);
</script>

<svelte:head>
	<title>{heading} — devcircles</title>
</svelte:head>

<div class="mx-auto flex max-w-lg flex-col items-start px-6 py-24">
	<span class="font-display text-sm font-semibold tracking-widest text-cobalt uppercase"
		>{page.status}</span
	>
	<h1 class="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">{heading}</h1>
	<p class="mt-3 text-ink/70">{detail}</p>
	<div class="mt-8 flex items-center gap-4">
		<a
			href="/"
			class="rounded-full bg-cobalt px-5 py-2.5 text-sm font-medium text-white hover:bg-cobalt/90"
		>
			back to the report
		</a>
		{#if page.status === 400}
			<a href="/google" class="text-sm text-cobalt hover:underline">try signing in again</a>
		{/if}
	</div>
</div>
