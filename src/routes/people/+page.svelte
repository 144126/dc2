<script lang="ts">
	import type { PageData } from './$types';
	import { ctrl_enter } from '$lib/ctrl_enter';
	import { sector_color, sector_info, sector_order } from '$lib/sectors';
	import Icon from '$lib/icon.svelte';

	let { data }: { data: PageData } = $props();
	let form: HTMLFormElement | undefined = $state();
</script>

<svelte:head>
	<title>people — devcircles</title>
	<meta
		name="description"
		content="find builders in the devcircles community by name, place, tags, or what they ship."
	/>
	<link rel="canonical" href="https://devcircles.apexlinks.org/people" />
</svelte:head>

<div class="mx-auto max-w-3xl px-6 py-16">
	<p class="font-mono text-xs tracking-[0.16em] text-cobalt uppercase">community</p>
	<h1 class="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">people</h1>
	<p class="mt-3 text-ink/60">
		anyone here can find anyone like them. search a name, a city, a tag, or what they build.
	</p>

	<form
		method="GET"
		bind:this={form}
		use:ctrl_enter={() => form?.requestSubmit()}
		class="mt-8 flex items-center gap-3"
	>
		<div class="flex flex-1 items-center gap-2 rounded-full border border-ink/20 px-4 py-2">
			<Icon n="search" c="h-4 w-4 text-ink/40" />
			<input
				name="q"
				value={data.q}
				placeholder="fintech abuja, rust, payments"
				class="w-full bg-transparent text-sm outline-none"
			/>
		</div>
		{#if data.c}<input type="hidden" name="c" value={data.c} />{/if}
		<button
			type="submit"
			class="rounded-full bg-cobalt px-5 py-2.5 text-sm font-medium text-white hover:bg-cobalt/90"
		>
			search
		</button>
	</form>
	<p class="mt-2 text-xs text-ink/50">ctrl+enter searches</p>

	<div class="mt-6 flex flex-wrap gap-2">
		<a
			href={data.q ? `/people?q=${encodeURIComponent(data.q)}` : '/people'}
			class="rounded-full border px-3 py-1.5 text-xs {data.c
				? 'border-ink/20 text-ink/60'
				: 'border-cobalt bg-cobalt text-white'}"
		>
			any sector
		</a>
		{#each sector_order as c (c)}
			<a
				href="/people?{new URLSearchParams({ ...(data.q ? { q: data.q } : {}), c }).toString()}"
				class="rounded-full border px-3 py-1.5 text-xs {data.c === c
					? 'border-cobalt bg-cobalt text-white'
					: 'border-ink/20 text-ink/60'}"
			>
				{sector_info[c].n}
			</a>
		{/each}
	</div>

	{#if data.people.length}
		<ul class="mt-10 flex flex-col gap-3">
			{#each data.people as p (p.hn)}
				<li class="rounded-lg border border-ink/10 p-4 hover:border-cobalt/40">
					<a href={p.to} class="flex items-start gap-4">
						{#if p.pf}
							<img src={p.pf} alt="" class="h-12 w-12 rounded-full object-cover" />
						{:else}
							<div
								class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full {sector_color[
									p.cs[0]
								] ?? 'bg-cobalt'}"
							>
								<span class="font-display text-lg font-semibold text-white">
									{p.hn.slice(0, 1).toUpperCase()}
								</span>
							</div>
						{/if}
						<span class="min-w-0 flex-1">
							<span class="flex flex-wrap items-baseline gap-x-2">
								<span class="font-display font-medium text-ink">@{p.hn}</span>
								{#if p.pn}
									<span class="text-sm text-ink/40">·</span>
									<span class="text-sm text-ink/50">{p.pn.toLowerCase()}</span>
								{/if}
								{#if p.like}
									<span class="ml-auto text-xs text-cobalt">{p.like} in common</span>
								{/if}
							</span>
							{#if p.bo}<span class="mt-1 block text-sm text-ink/70">{p.bo}</span>{/if}
						</span>
					</a>
					<div class="mt-3 flex flex-wrap items-center gap-2 pl-16 text-xs text-ink/50">
						{#if p.lc}<span>{p.lc}</span>{/if}
						{#if p.n}<span>{p.n} {p.n === 1 ? 'product' : 'products'}</span>{/if}
						{#each p.tg as t (t)}
							<a
								href="/people?q={encodeURIComponent(t)}"
								class="rounded-full border border-ink/10 px-2 py-0.5 hover:border-cobalt/40"
								>{t}</a
							>
						{/each}
						{#each p.cs as c (c)}
							<a
								href="/people?c={c}"
								class="rounded-full bg-cobalt/10 px-2 py-0.5 text-cobalt hover:bg-cobalt/20"
							>
								{sector_info[c]?.n ?? c}
							</a>
						{/each}
					</div>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="mt-10 text-ink/60">
			{#if data.q || data.c}
				nobody matched. try one word, or
				<a href="/people" class="text-cobalt hover:underline">see everyone</a>.
			{:else}
				nobody has a public profile yet.
			{/if}
		</p>
	{/if}

	{#if !data.signed_in}
		<p class="mt-10 text-sm text-ink/50">
			<a href="/google?next=/people" data-sveltekit-reload class="text-cobalt hover:underline"
				>sign in</a
			>
			to see who shares a place, tag, or sector with you.
		</p>
	{/if}
</div>
