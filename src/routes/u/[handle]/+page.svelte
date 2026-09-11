<script lang="ts">
	import type { PageData } from './$types';
	import { sector_color } from '$lib/sectors';
	import { profile_stats, joined } from '$lib/profile';
	import { fmt_date } from '$lib/fmt';
	import Icon from '$lib/icon.svelte';
	import StatusPill from '$lib/status_pill.svelte';
	import MessageBuilder from '$lib/message_builder.svelte';

	let { data }: { data: PageData } = $props();
	const p = $derived(data.prof);
	const products = $derived(data.products as Record<string, string>[]);
	const stats = $derived(profile_stats(products));
	const since = $derived(joined(products) || p.j);
	const name = $derived(p.nm || p.hn);
	const tint = $derived(sector_color[products[0]?.c] ?? 'bg-cobalt');

	const facts = $derived(
		[
			{ i: 'pin', v: p.lc, href: '' },
			{ i: 'link', v: p.lk.replace(/^https?:\/\//, ''), href: p.lk },
			{ i: 'code', v: p.li ? 'linkedin' : '', href: p.li },
			{
				i: 'calendar',
				v: since ? `joined ${fmt_date(new Date(since * 1000).toISOString())}` : '',
				href: ''
			}
		].filter((f) => f.v)
	);
</script>

<svelte:head>
	<title>{name} — devcircles</title>
	<meta name="description" content={p.bo || `${name} builds on devcircles.`} />
	<meta property="og:title" content={name} />
	<meta property="og:description" content={p.bo || `${name} builds on devcircles.`} />
	<link rel="canonical" href="https://devcircles.apexlinks.org/u/{p.hn}" />
</svelte:head>

<div class="mx-auto max-w-3xl px-6 pb-16">
	<div class="mt-6 h-40 w-full overflow-hidden rounded-lg border border-ink/10 md:h-56">
		{#if p.cb}
			<img src={p.cb} alt="" loading="lazy" class="h-full w-full object-cover" />
		{:else}
			<div class="h-full w-full {tint} opacity-90"></div>
		{/if}
	</div>

	<div class="-mt-12 flex items-end justify-between gap-4 px-1">
		<div class="rounded-full bg-paper p-1">
			{#if p.pf}
				<img
					src={p.pf}
					alt=""
					class="h-24 w-24 rounded-full border-4 border-paper object-cover"
				/>
			{:else}
				<div
					class="flex h-24 w-24 items-center justify-center rounded-full border-4 border-paper {tint}"
				>
					<span class="font-display text-3xl font-semibold text-white">
						{name.slice(0, 1).toUpperCase()}
					</span>
				</div>
			{/if}
		</div>
		{#if data.own}
			<a
				href="/profile"
				class="mb-2 rounded-full border border-ink/20 px-5 py-2 text-sm font-medium text-ink hover:border-cobalt/50"
			>
				edit profile
			</a>
		{/if}
	</div>

	<div class="mt-4">
		<h1 class="font-display text-3xl font-semibold tracking-tight text-ink">{name}</h1>
		<p class="mt-1 text-ink/50">@{p.hn}</p>
		{#if p.bo}<p class="mt-4 text-ink/75">{p.bo}</p>{/if}
		{#if p.tg.length}
			<div class="mt-4 flex flex-wrap gap-2">
				{#each p.tg as t (t)}
					<a
						href="/people?q={encodeURIComponent(t)}"
						class="rounded-full border border-ink/10 px-2 py-0.5 text-xs text-ink/60 hover:border-cobalt/40"
						>{t}</a
					>
				{/each}
			</div>
		{/if}

		{#if facts.length}
			<div class="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink/60">
				{#each facts as f (f.i)}
					<span class="flex items-center gap-1.5">
						<Icon n={f.i} c="h-4 w-4" />
						{#if f.href}
							<a href={f.href} target="_blank" rel="noopener" class="text-cobalt hover:underline"
								>{f.v}</a
							>
						{:else}
							{f.v}
						{/if}
					</span>
				{/each}
			</div>
		{/if}

		<div class="mt-6 flex gap-8 border-b border-ink/10 pb-6">
			<div class="flex gap-1.5">
				<span class="tnum font-display font-semibold text-ink">{stats.n}</span>
				<span class="text-ink/60">{stats.n === 1 ? 'product' : 'products'}</span>
			</div>
			<div class="flex gap-1.5">
				<span class="tnum font-display font-semibold text-ink">{stats.live}</span>
				<span class="text-ink/60">live</span>
			</div>
			{#if stats.raising}
				<div class="flex gap-1.5">
					<span class="tnum font-display font-semibold text-coral">{stats.raising}</span>
					<span class="text-ink/60">raising</span>
				</div>
			{/if}
		</div>
	</div>

	<section class="mt-10">
		<h2 class="font-mono text-xs tracking-[0.16em] text-cobalt uppercase">portfolio</h2>
		{#if products.length}
			<div class="mt-4 flex flex-col gap-3">
				{#each products as x (x.g)}
					<a
						href="/{x.g}"
						class="flex items-start gap-4 rounded-lg border border-ink/10 p-4 hover:border-cobalt/40"
					>
						<span
							class="flex h-10 w-10 shrink-0 items-center justify-center rounded {sector_color[x.c] ??
								'bg-cobalt'}"
						>
							<span class="font-display text-sm font-semibold text-white">{x.n.slice(0, 1)}</span>
						</span>
						<span class="min-w-0 flex-1">
							<span class="flex flex-wrap items-center gap-2">
								<span class="font-display font-medium text-ink">{x.n}</span>
								<StatusPill r={x.r} />
							</span>
							<span class="mt-1 block text-sm text-ink/70">{x.o}</span>
						</span>
					</a>
				{/each}
			</div>
		{:else}
			<p class="mt-3 text-ink/60">
				nothing on the directory yet.
				{#if data.own}<a href="/submit" class="text-cobalt hover:underline">submit your first product</a
					>.{/if}
			</p>
		{/if}
	</section>

	{#if data.rooms.length}
		<section class="mt-10">
			<h2 class="font-mono text-xs tracking-[0.16em] text-cobalt uppercase">rooms</h2>
			<div class="mt-4 flex flex-col gap-3">
				{#each data.rooms as r (r.hn)}
					<a
						href="/r/{r.hn}"
						class="flex items-start gap-4 rounded-lg border border-ink/10 p-4 hover:border-cobalt/40"
					>
						<span class="mt-1 text-ink/40"><Icon n="group" /></span>
						<span class="min-w-0 flex-1">
							<span class="font-display font-medium text-ink">{r.nm}</span>
							{#if r.ds}<span class="mt-1 block text-sm text-ink/70">{r.ds}</span>{/if}
							<span class="mt-1 block text-xs text-ink/50">{r.mb.length} in the room</span>
						</span>
					</a>
				{/each}
			</div>
		</section>
	{/if}

	{#if data.can_msg}
		<MessageBuilder hn={p.hn} who={name} signed_in={!!data.u} back="/u/{p.hn}" />
	{/if}
</div>
