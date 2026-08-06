<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { sector_info } from '$lib/sectors';
	import { headline, stage_label, raise_label, verify_label, is_fresh, as_of, age_days } from '$lib/investor';
	import { fmt_date, fmt_num } from '$lib/fmt';
	import StatusPill from '$lib/status_pill.svelte';
	import Interest from '$lib/interest.svelte';

	let { data }: { data: PageData } = $props();
	const p = $derived(data.p as Record<string, string> & { b?: Record<string, string> });
	const b = $derived(p.b ?? {});
	const is_owner = $derived(!!data.u && data.u.e === p.e);

	let show_preview = $state(false);

	const stamp_age = $derived(age_days(p.hj));
	const hd = $derived(headline(p));
	const current = $derived(is_fresh(p));

	const revenue_line = $derived(
		p.m === 'y' ? (p.a ? `yes, ₦${fmt_num(p.a)} / month` : 'yes') : p.m === 'n' ? 'no' : ''
	);
	const metrics = $derived(
		[
			{ k: 'launched', v: fmt_date(p.d) },
			{ k: 'users / signups / downloads', v: fmt_num(p.q) },
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

	const detail = $derived(p.w && p.w !== p.o ? p.w : '');
	const has_analysis = $derived(!!(detail || p.h || p.x));
</script>

<svelte:head>
	<title>{p.n} — devcircles</title>
	<meta name="description" content={p.o} />
	<meta property="og:title" content={p.n} />
	<meta property="og:description" content={p.o} />
</svelte:head>

<div class="mx-auto max-w-5xl px-6 py-16">
	<a href="/#s-{p.c}" class="text-sm text-ink/60 hover:text-cobalt hover:underline">← all products</a>

	{#if page.url.searchParams.has('submitted')}
		<div class="mt-6 rounded-lg bg-teal-brand/10 p-4 text-sm text-ink">
			submitted. your page starts in "{p.cn || sector_info[p.c]?.n}" with an "in review" badge — the
			devcircles team reviews new entries and marks working products as live. edit anytime below.
		</div>
	{:else if page.url.searchParams.has('saved')}
		<div class="mt-6 rounded-lg bg-teal-brand/10 p-4 text-sm text-ink">changes saved.</div>
	{:else if page.url.searchParams.has('confirmed')}
		<div class="mt-6 rounded-lg bg-teal-brand/10 p-4 text-sm text-ink">confirmed — dated today.</div>
	{/if}

	<div class="mt-6 flex flex-wrap items-center gap-3">
		<span class="text-xs tracking-wide text-cobalt uppercase">{p.cn || sector_info[p.c]?.n}</span>
		<StatusPill r={p.r} />
		{#if is_owner}
			<a href="/{p.g}/edit" class="ml-auto text-sm text-cobalt hover:underline">edit your page</a>
		{/if}
	</div>

	{#if is_owner && (stamp_age === null || stamp_age > 60)}
		<div class="mt-4 flex flex-wrap items-center gap-4 rounded-lg bg-ochre/10 p-4 text-sm">
			<span class="text-ink/75">
				{stamp_age === null
					? 'your figures have never been dated, so investors see them as unconfirmed.'
					: `your figures were last confirmed ${stamp_age} days ago and are sinking down the homepage.`}
			</span>
			<form method="POST" action="/{p.g}/edit?/confirm" use:enhance>
				<button type="submit" class="rounded-full bg-cobalt px-4 py-2 text-xs font-medium text-white hover:bg-cobalt/90">
					still accurate
				</button>
			</form>
			<a href="/{p.g}/edit" class="text-cobalt hover:underline">or update them</a>
		</div>
	{/if}

	<h1 class="mt-3 font-display text-4xl font-semibold tracking-tight text-ink">{p.n}</h1>

	{#if p.u}
		<a href={p.u} target="_blank" rel="noopener" class="mt-2 inline-block text-cobalt hover:underline">
			{p.l || p.u}
		</a>
	{/if}

	<p class="mt-8 max-w-3xl text-2xl leading-snug font-medium text-ink">{p.o}</p>

	{#if hd || p.sg || (p.ra === 'y' && current)}
		<div class="mt-10 flex flex-wrap items-end gap-x-12 gap-y-6">
			{#if hd}
				<div>
					<div class="font-display text-5xl font-semibold {current ? 'text-ink' : 'text-ink/40'}">
						{fmt_num(hd.v)}
					</div>
					<div class="mt-1 text-sm text-ink/60">{current ? hd.l : 'last reported ' + hd.l}</div>
					<div class="text-xs tracking-wide text-ink/40 uppercase">
						{verify_label[hd.hv]} · {as_of(hd.hj)}
					</div>
				</div>
			{/if}
			{#if p.sg && stage_label[p.sg]}
				<div>
					<div class="font-display text-xl font-medium text-ink">{stage_label[p.sg]}</div>
					<div class="mt-1 text-sm text-ink/60">stage</div>
				</div>
			{/if}
			{#if p.ra === 'y' && current}
				<div>
					<div class="font-display text-xl font-medium text-coral">{p.rt || raise_label.y}</div>
					<div class="mt-1 text-sm text-ink/60">raising</div>
				</div>
			{/if}
		</div>
	{/if}

	{#if has_analysis}
		<div class="mt-12 grid gap-10 sm:grid-cols-3">
			{#if detail}
				<div>
					<h2 class="text-sm font-semibold tracking-wide text-cobalt uppercase">what it does</h2>
					<p class="mt-2 text-ink/75">{detail}</p>
				</div>
			{/if}
			{#if p.h}
				<div>
					<h2 class="text-sm font-semibold tracking-wide text-cobalt uppercase">why it matters</h2>
					<p class="mt-2 text-ink/75">{p.h}</p>
				</div>
			{/if}
			{#if p.x}
				<div>
					<h2 class="text-sm font-semibold tracking-wide text-cobalt uppercase">where it can grow</h2>
					<p class="mt-2 text-ink/75">{p.x}</p>
				</div>
			{/if}
		</div>
	{/if}

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
			<p class="mt-4 text-xs text-ink/60">figures provided by the builder</p>
		{:else if is_owner}
			<p class="mt-2 text-ink/60">
				no metrics added yet. <a href="/{p.g}/edit" class="text-cobalt hover:underline">add them</a>
			</p>
		{:else}
			<p class="mt-2 text-ink/60">no metrics shared yet.</p>
		{/if}
	</div>

	{#if p.ev || p.vd}
		<div class="mt-8 rounded-lg border border-ink/10 p-6">
			<h2 class="font-display text-lg font-medium text-ink">what devcircles checked</h2>
			{#if p.ev}<p class="mt-2 text-ink/75">{p.ev}</p>{/if}
			{#if p.vd}<p class="mt-2 text-xs text-ink/50">link last checked {p.vd}</p>{/if}
			<p class="mt-4 text-xs text-ink/60">
				devcircles checks that a link works and what the product publicly offers. figures above come
				from the builder unless marked verified.
			</p>
		</div>
	{/if}

	{#if contacts.length}
		<div class="mt-8 rounded-lg border border-ink/10 p-6">
			<div class="flex items-center gap-4">
				{#if p.fp}
					<img src={p.fp} alt="" loading="lazy" class="h-14 w-14 rounded-full object-cover" />
				{/if}
				<h2 class="font-display text-lg font-medium text-ink">builder</h2>
			</div>
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

	<Interest pg={p.g} direct={b.e ?? ''} />

	{#if p.u}
		<div class="mt-14">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<h2 class="font-display text-lg font-medium text-ink">visit the product</h2>
				<div class="flex items-center gap-3">
					<button
						type="button"
						onclick={() => (show_preview = !show_preview)}
						class="text-sm text-cobalt hover:underline"
					>
						{show_preview ? 'hide preview' : 'preview inline'}
					</button>
					<a
						href={p.u}
						target="_blank"
						rel="noopener"
						class="rounded-full bg-cobalt px-4 py-2 text-sm text-white hover:bg-cobalt/90"
					>
						open {p.l || 'site'} ↗
					</a>
				</div>
			</div>
			{#if show_preview}
				<div class="mt-4 aspect-16/10 w-full overflow-hidden rounded-lg border border-ink/10">
					<iframe
						src={p.u}
						title={p.n}
						loading="lazy"
						sandbox="allow-scripts allow-forms allow-popups"
						class="h-full w-full"
					></iframe>
				</div>
				<p class="mt-3 text-sm text-ink/60">blank box? some sites block embedding — use "open" above.</p>
			{/if}
		</div>
	{/if}
</div>
