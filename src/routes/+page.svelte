<script lang="ts">
	import type { PageData } from './$types';
	import favicon from '$lib/assets/favicon.png';
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { sector_order, sector_info, sector_color, status_legend } from '$lib/sectors';
	import { fmt_date, fmt_num } from '$lib/fmt';
	import StatusPill from '$lib/status_pill.svelte';

	let { data }: { data: PageData } = $props();
	let open = $state(Object.fromEntries(sector_order.map((c) => [c, true])));

	let qy = $state('');
	let live_only = $state(false);

	const status_rank: Record<string, number> = { l: 0, p: 1, u: 2 };

	const filtered = $derived(
		data.p.filter(
			(x) =>
				(!live_only || x.r === 'l') &&
				(x.n + ' ' + x.o).toLowerCase().includes(qy.toLowerCase())
		)
	);

	const total = $derived(data.p.length);
	const live = $derived(data.p.filter((x) => x.r === 'l').length);
	const groups = $derived(
		sector_order
			.map((c) => ({
				c,
				items: filtered
					.filter((x) => x.c === c)
					.sort(
						(a, b) => (status_rank[a.r] ?? 3) - (status_rank[b.r] ?? 3) || a.n.localeCompare(b.n)
					)
			}))
			.filter((g) => g.items.length)
	);
	const is_filtering = $derived(qy !== '' || live_only);
</script>

<svelte:head>
	<title>devcircles — products built by the abuja developer community</title>
	<meta
		name="description"
		content="a guided tour of the products, platforms, and companies made by members of the abuja devcircles community — with self-reported traction, in plain language."
	/>
	<meta property="og:title" content="devcircles — products built in abuja" />
	<meta
		property="og:description"
		content="a guided tour of the products, platforms, and companies made by members of the abuja devcircles community."
	/>
</svelte:head>

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
		<div class="mt-4 flex items-center gap-4">
			<img src={favicon} alt="" class="h-12 w-12 shrink-0" />
			<h1 class="font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
				devcircles
			</h1>
		</div>
		<p class="mt-6 max-w-2xl text-lg leading-relaxed text-ink/70">
			a guided tour of the products, platforms, and companies made by members of the abuja
			devcircles community. written in plain language, for investors and for everyone else.
		</p>
	</div>
</section>

{#if data.degraded}
	<div class="border-y border-ochre/40 bg-ochre/10 px-6 py-4 text-center text-sm text-ink">
		live data is temporarily unavailable — the directory will be back shortly.
	</div>
{:else}
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
			<div class="col-span-2 self-end text-sm text-ink/60 sm:col-span-1">
				{data.updated ? `updated ${fmt_date(new Date(data.updated * 1000).toISOString())} · ` : ''}figures
				are self-reported by builders, not audited.
			</div>
		</div>
	</section>

	<section class="mx-auto max-w-5xl px-6 pt-8 text-sm text-ink/60">
		<span class="font-medium text-ink/70">status:</span>
		<StatusPill r="l" /> {status_legend.l} ·
		<StatusPill r="p" /> {status_legend.p} ·
		<StatusPill r="u" /> {status_legend.u}
	</section>

	<section class="mx-auto max-w-5xl px-6 pt-8">
		<div class="flex flex-wrap items-center gap-3">
			<input
				bind:value={qy}
				type="search"
				placeholder="search products…"
				class="w-full max-w-xs rounded-full border border-ink/20 px-4 py-2 text-sm"
			/>
			<button
				type="button"
				onclick={() => (live_only = !live_only)}
				class="rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-wide {live_only
					? 'border-cobalt bg-cobalt text-white'
					: 'border-ink/20 text-ink/60'}"
			>
				live only
			</button>
			{#if is_filtering}
				<span class="text-sm text-ink/50">{filtered.length} match{filtered.length === 1 ? '' : 'es'}</span>
			{/if}
		</div>
	</section>

	<section class="mx-auto max-w-5xl px-6 py-16">
		<div class="flex flex-col gap-14">
			{#each groups as g (g.c)}
				<div id="s-{g.c}">
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
					{#if open[g.c]}
						<p class="mt-3 max-w-2xl text-sm text-ink/60">{sector_info[g.c].i}</p>
						<div
							transition:slide={{ duration: 300, easing: cubicOut }}
							class="mt-5 flex flex-col divide-y divide-ink/10 border-y border-ink/10"
						>
							{#each g.items as it (it.g)}
								<a
									href="/{it.g}"
									class="flex flex-col gap-2 py-4 transition-colors hover:bg-ink/[0.03] sm:flex-row sm:items-center sm:gap-6"
								>
									<span class="font-display w-48 shrink-0 truncate font-medium text-ink">{it.n}</span>
									<StatusPill r={it.r} />
									<span class="flex-1 text-sm text-ink/70">{it.o}</span>
									{#if it.k || it.q}
										<span class="shrink-0 text-xs text-ink/60">{it.k || `${fmt_num(it.q)} users`}</span>
									{/if}
								</a>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
			{#if is_filtering && !groups.length}
				<p class="text-center text-ink/60">no products match your search.</p>
			{/if}
		</div>
	</section>
{/if}

<section id="about" class="border-t border-ink/10 bg-white">
	<div class="mx-auto max-w-3xl px-6 py-16">
		<h2 class="font-display text-2xl font-semibold text-ink">about this report</h2>
		<div class="mt-6 flex flex-col gap-4 text-ink/70">
			<p>
				devcircles is a developer community in abuja. this page is a running directory of what
				members have built, kept up to date by the people building it.
			</p>
			<p>
				every entry is submitted by its own builder. new entries start in "in review"; the
				devcircles team checks working products before marking them "live". figures on each
				product page — users, revenue, team size — are self-reported by the builder, not audited.
			</p>
			<p>updated on a rolling basis as builders submit and edit their own pages.</p>
		</div>
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
