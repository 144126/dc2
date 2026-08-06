<script lang="ts">
	import type { PageData } from './$types';
	import { by_momentum, is_fresh } from '$lib/investor';
	import DealCard from '$lib/deal_card.svelte';

	let { data }: { data: PageData } = $props();
	const ranked = $derived([...data.p].filter(is_fresh).sort(by_momentum));
</script>

<svelte:head>
	<title>nigerian startups raising right now — devcircles</title>
	<meta
		name="description"
		content="companies built by the devcircles community that are raising capital right now, with what each one has actually shipped and the numbers they report."
	/>
	<link rel="canonical" href="https://devcircles.apexlinks.org/raising" />
</svelte:head>

<div class="mx-auto max-w-5xl px-6 py-16">
	<h1 class="font-display text-4xl font-semibold tracking-tight text-ink">raising right now</h1>
	<p class="mt-4 max-w-2xl text-ink/70">
		{ranked.length} companies in the devcircles community are raising. every link here has been
		checked by hand; every figure is labelled verified or self-reported.
	</p>
	{#if ranked.length}
		<div class="mt-10 flex flex-col divide-y divide-ink/10 border-y border-ink/10">
			{#each ranked as p (p.g)}
				<DealCard {p} />
			{/each}
		</div>
	{:else}
		<p class="mt-10 text-ink/60">nobody has marked themselves as raising yet.</p>
	{/if}
	<a href="/" class="mt-10 inline-block text-sm text-cobalt hover:underline">← all companies</a>
</div>
