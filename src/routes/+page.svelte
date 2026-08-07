<script lang="ts">
	import type { PageData } from './$types';
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { page } from '$app/state';
	import { sector_color, sector_info, sector_order, status_legend } from '$lib/sectors';
	import { is_fresh, by_momentum } from '$lib/investor';
	import { country_name, state_name, place_line } from '$lib/places';
	import DealCard from '$lib/deal_card.svelte';
	import CircleField from '$lib/circle_field.svelte';
	import { reveal } from '$lib/reveal';
	import { fmt_date } from '$lib/fmt';
	import StatusPill from '$lib/status_pill.svelte';

	type P = Record<string, string>;

	let { data }: { data: PageData } = $props();
	let open = $state<Record<string, boolean>>({});
	let picked = $state('');

	let qy = $state('');
	let live_only = $state(false);
	let earning_only = $state(false);
	let raising_only = $state(false);
	let community = $state('');

	const community_key = (x: P) => (x.co ? `${x.co}:${x.st ?? ''}` : '');

	const communities = $derived.by(() => {
		const counts = new Map<string, number>();
		for (const x of data.p) {
			const k = community_key(x);
			if (k) counts.set(k, (counts.get(k) ?? 0) + 1);
		}
		return [...counts]
			.map(([k, count]) => {
				const [co, st] = k.split(':');
				return {
					k,
					label: st ? `${state_name(co, st)} · ${country_name(co)}` : `${country_name(co)} — community not given`,
					count
				};
			})
			.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
	});

	const views = [
		['traction', 'by traction'],
		['sector', 'by sector'],
		['country', 'by country'],
		['state', 'by state']
	];
	const view = $derived(picked || page.url.searchParams.get('v') || 'traction');

	const rank = (c: string) => {
		const i = (sector_order as readonly string[]).indexOf(c);
		return i < 0 ? sector_order.length : i;
	};

	const dot = (k: string, i: number) =>
		view === 'sector'
			? (sector_color[k] ?? 'bg-white/60')
			: ['bg-coral', 'bg-ochre', 'bg-teal-brand', 'bg-plum'][i % 4];

	const filtered = $derived(
		data.p.filter(
			(x) =>
				(!live_only || x.r === 'l') &&
				(!earning_only || x.m === 'y') &&
				(!raising_only || x.ra === 'y') &&
				(!community || community_key(x) === community) &&
				(x.n + ' ' + x.o + ' ' + place_line(x.co, x.st)).toLowerCase().includes(qy.toLowerCase())
		)
	);

	const total = $derived(data.p.length);
	const earning = $derived(data.p.filter((x) => x.m === 'y' && is_fresh(x)).length);
	const raising = $derived(data.p.filter((x) => x.ra === 'y' && is_fresh(x)).length);

	const group_key = (x: P) =>
		view === 'sector' ? (x.c ?? '') : view === 'country' ? (x.co ?? '') : x.co && x.st ? `${x.co}:${x.st}` : '';

	const group_name = (k: string, items: P[]) => {
		if (view === 'sector') return items[0]?.cn || sector_info[k]?.n || k || 'sector not given';
		if (view === 'country') return country_name(k);
		if (!k) return 'location not given';
		const [co, st] = k.split(':');
		return `${state_name(co, st)} · ${country_name(co)}`;
	};

	const groups = $derived.by(() => {
		if (view === 'traction') return [];
		const map = new Map<string, P[]>();
		for (const x of filtered) {
			const k = group_key(x);
			if (!map.has(k)) map.set(k, []);
			map.get(k)!.push(x);
		}
		return [...map]
			.map(([k, items]) => ({ k, n: group_name(k, items), items: [...items].sort(by_momentum) }))
			.sort((a, b) => {
				if (!a.k !== !b.k) return a.k ? -1 : 1;
				if (view === 'sector') return rank(a.k) - rank(b.k);
				return b.items.length - a.items.length || a.n.localeCompare(b.n);
			});
	});

	const is_filtering = $derived(
		qy !== '' || live_only || earning_only || raising_only || community !== ''
	);
	const ranked = $derived([...filtered].sort(by_momentum));
</script>

<svelte:head>
	<title>devcircles — products built by the devcircles community</title>
	<meta
		name="description"
		content="a guided tour of the products, platforms, and companies made by members of the devcircles community — with self-reported traction, in plain language."
	/>
	<meta property="og:title" content="devcircles — products built by the community" />
	<meta
		property="og:description"
		content="a guided tour of the products, platforms, and companies made by members of the devcircles community."
	/>
</svelte:head>

<section class="mx-auto max-w-5xl px-6 pt-16 pb-10 sm:pt-24">
	<p class="font-mono text-xs tracking-[0.18em] text-cobalt uppercase">
		01 — industry insight report
	</p>

	<h1
		class="font-display mt-6 overflow-hidden text-display leading-[0.88] font-semibold tracking-[-0.035em] text-ink"
	>
		<span class="animate-rise block">devcircles</span>
	</h1>

	<div class="mt-10 grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-center">
		<p class="max-w-lg text-lede leading-[1.35] text-ink/75">
			<span class="tnum text-ink">{total} companies</span> built by this community, across
			<span class="tnum text-ink">{communities.length}</span> circles. every link checked by hand, every
			figure dated and labelled.
		</p>

		{#if communities.length}
			<CircleField circles={communities} bind:selected={community} />
		{/if}
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
				<div class="text-sm text-ink/60">companies</div>
			</div>
			<div>
				<div class="font-display text-3xl font-semibold text-cobalt">{earning}</div>
				<div class="text-sm text-ink/60">already making revenue</div>
			</div>
			<div>
				<div class="font-display text-3xl font-semibold text-cobalt">{raising}</div>
				<div class="text-sm text-ink/60">raising right now</div>
			</div>
			<div class="col-span-2 self-end text-sm text-ink/60 sm:col-span-1">
				{data.updated
					? `updated ${fmt_date(new Date(data.updated * 1000).toISOString())} · `
					: ''}<span>figures are self-reported by builders, not audited.</span>
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
				onclick={() => (raising_only = !raising_only)}
				class="rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-wide {raising_only
					? 'border-cobalt bg-cobalt text-white'
					: 'border-ink/20 text-ink/60'}"
			>
				raising now
			</button>
			<button
				type="button"
				onclick={() => (earning_only = !earning_only)}
				class="rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-wide {earning_only
					? 'border-cobalt bg-cobalt text-white'
					: 'border-ink/20 text-ink/60'}"
			>
				making revenue
			</button>
			<button
				type="button"
				onclick={() => (live_only = !live_only)}
				class="rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-wide {live_only
					? 'border-cobalt bg-cobalt text-white'
					: 'border-ink/20 text-ink/60'}"
			>
				live only
			</button>
			{#if community}
				<button
					type="button"
					onclick={() => (community = '')}
					class="rounded-full border border-coral bg-coral px-3 py-1.5 text-xs font-medium tracking-wide text-white uppercase"
				>
					{communities.find((c) => c.k === community)?.label} ✕
				</button>
			{/if}
			{#if is_filtering}
				<span class="tnum text-sm text-ink/50">
					{filtered.length} match{filtered.length === 1 ? '' : 'es'}
				</span>
			{/if}
		</div>
	</section>

	<section class="mx-auto max-w-5xl px-6 py-16">
		<div class="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
			{#each views as [v, label] (v)}
				<button
					type="button"
					onclick={() => (picked = v)}
					class={view === v ? 'font-medium text-cobalt underline' : 'text-ink/50 hover:text-ink'}
				>
					{label}
				</button>
			{/each}
		</div>
		{#if view === 'traction'}
			<div class="flex flex-col divide-y divide-ink/10 border-y border-ink/10">
				{#each ranked as it, i (it.g)}
					<div use:reveal={Math.min(i, 8) * 45}>
						<DealCard p={it} />
					</div>
				{/each}
			</div>
		{:else}
			<div class="flex flex-col gap-14">
				{#each groups as g, i (g.k)}
					<div id="s-{g.k}">
						<button
							type="button"
							aria-expanded={open[g.k] ?? true}
							onclick={() => (open[g.k] = !(open[g.k] ?? true))}
							class="flex w-full items-center gap-3 bg-cobalt px-5 py-3 text-left text-white"
						>
							<span class="h-2.5 w-2.5 rounded-full {dot(g.k, i)}"></span>
							<h2 class="font-display text-lg font-medium tracking-tight">
								{g.n}
							</h2>
							<span class="ml-auto text-sm text-white/70">{g.items.length}</span>
							<svg
								viewBox="0 0 20 20"
								fill="none"
								class="h-4 w-4 shrink-0 transition-transform duration-300 {(open[g.k] ?? true)
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
						{#if open[g.k] ?? true}
							<div
								transition:slide={{ duration: 300, easing: cubicOut }}
								class="mt-5 flex flex-col divide-y divide-ink/10 border-y border-ink/10"
							>
								{#each g.items as it (it.g)}
									<DealCard p={it} />
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
		{#if is_filtering && !filtered.length}
			<p class="mt-10 text-center text-ink/60">no products match your search.</p>
		{/if}
	</section>
{/if}

<section id="about" class="border-t border-ink/10 bg-white">
	<div class="mx-auto max-w-3xl px-6 py-16">
		<h2 class="font-display text-2xl font-semibold text-ink">about this report</h2>
		<div class="mt-6 flex flex-col gap-4 text-ink/70">
			<p>
				devcircles is a developer community. this page is a running directory of what members
				have built, kept up to date by the people building it.
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
