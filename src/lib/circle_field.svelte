<script lang="ts">
	import { pack, radius_for, view_box, type Disc } from '$lib/pack';

	type Circle = { k: string; label: string; count: number };

	let {
		circles,
		selected = $bindable('')
	}: { circles: Circle[]; selected?: string } = $props();

	let hovered = $state('');

	const ordered = $derived([...circles].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)));
	const discs = $derived(pack(ordered.map((c) => radius_for(c.count))) as Disc[]);
	const box = $derived(view_box(discs, 6));
	const active = $derived(hovered || selected);

	const toggle = (k: string) => (selected = selected === k ? '' : k);
</script>

<figure class="flex flex-col gap-4">
	<svg
		viewBox={box}
		role="group"
		aria-label="devcircles communities, sized by how many companies each has produced"
		class="field w-full"
	>
		{#each ordered as c, i (c.k)}
			{@const d = discs[i]}
			<g
				role="button"
				tabindex="0"
				aria-label="{c.label}, {c.count} {c.count === 1 ? 'company' : 'companies'}"
				aria-pressed={selected === c.k}
				class="animate-rise cursor-pointer outline-none"
				onmouseenter={() => (hovered = c.k)}
				onmouseleave={() => (hovered = '')}
				onfocus={() => (hovered = c.k)}
				onblur={() => (hovered = '')}
				onclick={() => toggle(c.k)}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						toggle(c.k);
					}
				}}
			>
				<circle
					cx={d.x}
					cy={d.y}
					r={d.r}
					class="origin-center transition-all duration-300 ease-out-expo {active && active !== c.k
						? 'fill-cobalt/15'
						: 'fill-cobalt/80'}"
				/>
				{#if selected === c.k}
					<circle
						cx={d.x}
						cy={d.y}
						r={d.r + 5}
						class="fill-none stroke-coral"
						stroke-width="2"
					/>
				{/if}
				{#if d.r > 26}
					<text
						x={d.x}
						y={d.y + 5}
						text-anchor="middle"
						class="tnum pointer-events-none fill-paper font-display text-[15px] font-semibold"
					>
						{c.count}
					</text>
				{/if}
			</g>
		{/each}
	</svg>

	<figcaption class="font-mono min-h-[1.5rem] text-xs tracking-wide text-ink/60">
		{#if active}
			{@const c = ordered.find((x) => x.k === active)}
			<span class="text-ink">{c?.label}</span> — {c?.count}
			{c?.count === 1 ? 'company' : 'companies'}{selected === active ? ' · filtering' : ''}
		{:else}
			every circle is a devcircles community, sized by what it has built. touch one to filter.
		{/if}
	</figcaption>
</figure>
