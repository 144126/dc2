<script lang="ts">
	import type { PageData } from './$types';
	import { sector_info } from '$lib/sectors';
	import StatusPill from '$lib/status_pill.svelte';

	let { data }: { data: PageData } = $props();
	const p = $derived(data.p as Record<string, string> & { b?: Record<string, string> });
	const b = $derived(p.b ?? {});

	const revenue_line = $derived(
		p.m === 'y' ? (p.a ? `yes, ${p.a}` : 'yes') : p.m === 'n' ? 'no' : ''
	);
	const metrics = $derived(
		[
			{ k: 'launched', v: p.d },
			{ k: 'users / signups / downloads', v: p.q },
			{ k: 'revenue', v: revenue_line },
			{ k: 'team size', v: p.z },
			{ k: 'proudest metric', v: p.k }
		].filter((m) => m.v)
	);

	const contacts = $derived(
		[
			{ k: 'name', v: b.n },
			{ k: 'email', v: b.e, href: b.e ? `mailto:${b.e}` : undefined },
			{ k: 'phone', v: b.p },
			{ k: 'linkedin', v: b.l, href: b.l },
			{ k: 'location', v: b.c }
		].filter((c) => c.v)
	);
</script>

<div class="mx-auto max-w-5xl px-6 py-16">
	<div class="flex flex-wrap items-center gap-3">
		<span class="text-xs tracking-wide text-cobalt uppercase">{sector_info[p.c]?.n}</span>
		<StatusPill r={p.r} />
	</div>

	<h1 class="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">{p.n}</h1>

	{#if p.u}
		<a href={p.u} target="_blank" rel="noopener" class="mt-2 inline-block text-cobalt hover:underline">
			{p.l || p.u}
		</a>
	{/if}

	<p class="mt-8 max-w-3xl text-2xl leading-snug font-medium text-ink">{p.o}</p>

	<div class="mt-12 grid gap-10 sm:grid-cols-3">
		<div>
			<h2 class="text-sm font-semibold tracking-wide text-cobalt uppercase">what it does</h2>
			<p class="mt-2 text-ink/75">{p.w}</p>
		</div>
		<div>
			<h2 class="text-sm font-semibold tracking-wide text-cobalt uppercase">why it matters</h2>
			<p class="mt-2 text-ink/75">{p.h || 'not yet described.'}</p>
		</div>
		<div>
			<h2 class="text-sm font-semibold tracking-wide text-cobalt uppercase">where it can grow</h2>
			<p class="mt-2 text-ink/75">{p.x || 'not yet described.'}</p>
		</div>
	</div>

	<div class="mt-14 rounded-lg border border-ink/10 p-6">
		<h2 class="font-display text-lg font-medium text-ink">metrics</h2>
		{#if metrics.length}
			<dl class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
				{#each metrics as m (m.k)}
					<div>
						<dt class="text-xs text-ink/50 uppercase">{m.k}</dt>
						<dd class="mt-1 text-ink">{m.v}</dd>
					</div>
				{/each}
			</dl>
			<p class="mt-4 text-xs text-ink/40">figures provided by the builder</p>
		{:else}
			<p class="mt-2 text-ink/60">
				no metrics submitted yet. <a href="/submit" class="text-cobalt hover:underline"
					>add them</a
				>
			</p>
		{/if}
	</div>

	{#if contacts.length}
		<div class="mt-8 rounded-lg border border-ink/10 p-6">
			<h2 class="font-display text-lg font-medium text-ink">builder</h2>
			<dl class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
				{#each contacts as c (c.k)}
					<div>
						<dt class="text-xs text-ink/50 uppercase">{c.k}</dt>
						<dd class="mt-1 text-ink">
							{#if c.href}
								<a href={c.href} class="text-cobalt hover:underline" target="_blank" rel="noopener"
									>{c.v}</a
								>
							{:else}
								{c.v}
							{/if}
						</dd>
					</div>
				{/each}
			</dl>
		</div>
	{/if}

	{#if p.u}
		<div class="mt-14">
			<div class="aspect-16/10 w-full overflow-hidden rounded-lg border border-ink/10">
				<iframe src={p.u} title={p.n} loading="lazy" class="h-full w-full"></iframe>
			</div>
			<div class="mt-3 flex items-center justify-between text-sm text-ink/50">
				<span>some sites refuse embedding</span>
				<a
					href={p.u}
					target="_blank"
					rel="noopener"
					class="rounded-full bg-cobalt px-4 py-2 text-white hover:bg-cobalt/90"
				>
					open site
				</a>
			</div>
		</div>
	{/if}
</div>
