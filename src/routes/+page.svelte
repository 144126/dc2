<script lang="ts">
	import type { PageData } from './$types';
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { sector_order, sector_info, sector_color } from '$lib/sectors';
	import StatusPill from '$lib/status_pill.svelte';

	let { data }: { data: PageData } = $props();
	let open = $state(Object.fromEntries(sector_order.map((c) => [c, true])));

	const total = $derived(data.p.length);
	const live = $derived(data.p.filter((x) => x.r === 'l').length);
	const groups = $derived(
		sector_order
			.map((c) => ({ c, items: data.p.filter((x) => x.c === c) }))
			.filter((g) => g.items.length)
	);
</script>

<section class="relative overflow-hidden">
	<div
		class="absolute top-8 right-10 h-24 w-24 rounded-full border-4 border-ochre/40 max-md:hidden"
	></div>
	<div class="absolute top-32 right-40 h-10 w-10 rotate-45 bg-coral/20 max-md:hidden"></div>
	<div class="absolute bottom-6 left-8 h-16 w-16 rounded-full bg-teal-brand/10 max-md:hidden"></div>
	<div
		class="absolute right-24 bottom-10 h-14 w-14 rotate-12 border-4 border-plum/30 max-md:hidden"
	></div>

	<div class="relative mx-auto max-w-5xl px-6 py-20">
		<p class="font-display text-sm font-semibold tracking-widest text-cobalt uppercase">
			industry insight report
		</p>
		<h1 class="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
			devcircles
		</h1>
		<p class="mt-6 max-w-2xl text-lg leading-relaxed text-ink/70">
			a guided tour of the products, platforms, and companies made by members of the abuja
			devcircles community. written in plain language, for investors and for everyone else.
		</p>
	</div>
</section>

<section class="border-y border-ink/10 bg-cobalt/5">
	<div class="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-6 py-8 sm:grid-cols-4">
		<div>
			<div class="font-display text-3xl font-semibold text-cobalt">{total}</div>
			<div class="text-sm text-ink/60">products tracked</div>
		</div>
		<div>
			<div class="font-display text-3xl font-semibold text-cobalt">{live}</div>
			<div class="text-sm text-ink/60">live today</div>
		</div>
		<div>
			<div class="font-display text-3xl font-semibold text-cobalt">{groups.length}</div>
			<div class="text-sm text-ink/60">sectors covered</div>
		</div>
		<div class="col-span-2 self-end text-sm text-ink/50 sm:col-span-1">
			self-reported metrics: figures come from the builders themselves, not audited financials.
		</div>
	</div>
</section>

<section class="mx-auto max-w-5xl px-6 py-16">
	<div class="flex flex-col gap-14">
		{#each groups as g (g.c)}
			<div>
				<button
					type="button"
					aria-expanded={open[g.c]}
					onclick={() => (open[g.c] = !open[g.c])}
					class="flex w-full items-center gap-3 bg-cobalt px-5 py-3 text-left text-white"
				>
					<span class="h-2.5 w-2.5 rounded-full {sector_color[g.c]}"></span>
					<h2 class="font-display text-lg font-medium tracking-tight">
						{sector_info[g.c].n}
					</h2>
					<span class="ml-auto text-sm text-white/70">{g.items.length}</span>
					<svg
						viewBox="0 0 20 20"
						fill="none"
						class="h-4 w-4 shrink-0 transition-transform duration-300 {open[g.c]
							? 'rotate-0'
							: '-rotate-90'}"
					>
						<path
							d="M5 7.5l5 5 5-5"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>
				<p class="mt-3 max-w-2xl text-sm text-ink/60">{sector_info[g.c].i}</p>
				{#if open[g.c]}
					<div
						transition:slide={{ duration: 300, easing: cubicOut }}
						class="mt-5 flex flex-col divide-y divide-ink/10 border-y border-ink/10"
					>
						{#each g.items as it (it.g)}
							<a
								href="/{it.g}"
								class="flex flex-col gap-2 py-4 transition-colors hover:bg-ink/[0.03] sm:flex-row sm:items-center sm:gap-6"
							>
								<span class="font-display w-48 shrink-0 font-medium text-ink">{it.n}</span>
								<StatusPill r={it.r} />
								<span class="text-sm text-ink/70">{it.o}</span>
							</a>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</section>

<section class="border-t border-ink/10 bg-cobalt/5">
	<div class="mx-auto max-w-5xl px-6 py-16 text-center">
		<h2 class="font-display text-2xl font-semibold text-ink">
			built something? add it to the report
		</h2>
		<a
			href="/submit"
			class="mt-6 inline-flex items-center rounded-full bg-cobalt px-6 py-3 text-sm font-medium text-white hover:bg-cobalt/90"
		>
			submit your product
		</a>
	</div>
</section>
