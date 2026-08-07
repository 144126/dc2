<script lang="ts">
	import { headline, stage_label, raise_label, verify_label, is_fresh, as_of } from '$lib/investor';
	import { place_line } from '$lib/places';
	import { fmt_num } from '$lib/fmt';
	import StatusPill from '$lib/status_pill.svelte';

	let { p }: { p: Record<string, string> & { b?: Record<string, string> } } = $props();

	const hd = $derived(headline(p));
	const current = $derived(is_fresh(p));
	const who = $derived(p.b?.n ?? '');
	const place = $derived(place_line(p.co, p.st));
	const initials = $derived(
		who
			.split(' ')
			.filter(Boolean)
			.slice(0, 2)
			.map((s) => s[0])
			.join('')
			.toLowerCase()
	);
</script>

<a
	href="/{p.g}"
	class="grid grid-cols-[auto_1fr] items-start gap-4 py-5 transition-colors hover:bg-ink/[0.03] sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-6"
>
	{#if p.fp}
		<img src={p.fp} alt="" loading="lazy" class="h-12 w-12 shrink-0 rounded-full object-cover" />
	{:else}
		<span
			class="font-display flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cobalt/10 text-sm font-medium text-cobalt"
		>
			{initials || '—'}
		</span>
	{/if}

	<div class="min-w-0">
		<div class="flex flex-wrap items-center gap-2">
			<span class="font-display font-medium text-ink">{p.n}</span>
			<StatusPill r={p.r} />
			{#if p.ra === 'y' && current}
				<span class="rounded-full bg-coral px-2.5 py-1 text-[10px] font-medium tracking-wide text-white uppercase">
					{raise_label.y}
				</span>
			{/if}
		</div>
		<p class="mt-1 text-sm text-ink/70">{p.o}</p>
		<div class="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-ink/50">
			{#if p.sg && stage_label[p.sg]}<span>{stage_label[p.sg]}</span>{/if}
			{#if place}<span>{place}</span>{/if}
			{#if who}<span>{who.toLowerCase()}</span>{/if}
		</div>
	</div>

	<div class="col-span-2 sm:col-span-1 sm:w-44 sm:text-right">
		{#if hd}
			<div class="font-display text-2xl font-semibold {current ? 'text-ink' : 'text-ink/40'}">
				{fmt_num(hd.v)}
			</div>
			<div class="text-xs text-ink/60">{current ? hd.l : 'last reported ' + hd.l}</div>
			<div class="text-[10px] tracking-wide text-ink/40 uppercase">
				{verify_label[hd.hv]} · {as_of(hd.hj)}
			</div>
		{:else}
			<div class="text-xs text-ink/40">no numbers shared yet</div>
		{/if}
	</div>
</a>
