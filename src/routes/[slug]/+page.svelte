<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import { sector_info, sector_color } from '$lib/sectors';
	import { place_line } from '$lib/places';
	import { headline, stage_label, raise_label, verify_label, is_fresh, as_of, age_days } from '$lib/investor';
	import { split_list, action_links, number_cards } from '$lib/detail';
	import { fmt_num } from '$lib/fmt';
	import Icon from '$lib/icon.svelte';
	import StatusPill from '$lib/status_pill.svelte';
	import Interest from '$lib/interest.svelte';
	import MessageBuilder from '$lib/message_builder.svelte';

	let { data }: { data: PageData } = $props();
	const p = $derived(data.p as Record<string, string> & { b?: Record<string, string> });
	const b = $derived(p.b ?? {});
	const is_owner = $derived(!!data.own);

	let show_preview = $state(false);

	const stamp_age = $derived(age_days(p.hj));
	const asks = $derived((data.asks ?? []) as Record<string, string>[]);
	const rel = $derived((data.rel ?? []) as Record<string, string>[]);
	const hd = $derived(headline(p));
	const current = $derived(is_fresh(p));

	const sector_name = $derived(p.cn || sector_info[p.c]?.n || 'devcircles');
	const links = $derived(action_links(p));
	const shots = $derived(split_list(p.sc));
	const stack = $derived(split_list(p.ts));
	const cards = $derived(number_cards(p));
	const place = $derived(place_line(p.co, p.st));
	const detail = $derived(p.w && p.w !== p.o ? p.w : '');

	const contacts = $derived(
		[
			{ k: 'email', v: b.e, href: b.e ? `mailto:${b.e}` : undefined },
			{ k: 'phone', v: b.p, href: undefined },
			{ k: 'linkedin', v: b.l, href: b.l }
		].filter((c) => c.v)
	);

	const ld = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'SoftwareApplication',
			name: p.n,
			description: p.o,
			url: p.u,
			applicationCategory: p.cn || p.c,
			...(b.n ? { author: { '@type': 'Person', name: b.n } } : {}),
			...(p.d ? { datePublished: p.d } : {})
		})
	);
</script>

<svelte:head>
	<title>{p.n} — devcircles</title>
	<meta name="description" content={p.o} />
	<meta property="og:title" content={p.n} />
	<meta property="og:description" content={p.o} />
	<meta property="og:url" content="https://devcircles.apexlinks.org/{p.g}" />
	<meta property="og:type" content="article" />
	<link rel="canonical" href="https://devcircles.apexlinks.org/{p.g}" />
	{@html `<script type="application/ld+json">${ld}<` + `/script>`}
</svelte:head>

<div class="mx-auto max-w-5xl px-6 py-12">
	<a href="/?v=sector#s-{p.c}" class="text-sm text-ink/60 hover:text-cobalt hover:underline">
		← all products
	</a>

	{#if page.url.searchParams.has('submitted')}
		<div class="mt-6 rounded-lg bg-teal-brand/10 p-4 text-sm text-ink">
			submitted. your page starts in "{sector_name}" with an "in review" badge — the devcircles team
			reviews new entries and marks working products as live. edit anytime below.
		</div>
	{:else if page.url.searchParams.has('saved')}
		<div class="mt-6 rounded-lg bg-teal-brand/10 p-4 text-sm text-ink">changes saved.</div>
	{:else if page.url.searchParams.has('confirmed')}
		<div class="mt-6 rounded-lg bg-teal-brand/10 p-4 text-sm text-ink">confirmed — dated today.</div>
	{/if}

	{#if is_owner && (stamp_age === null || stamp_age > 60)}
		<div class="mt-6 flex flex-wrap items-center gap-4 rounded-lg bg-ochre/10 p-4 text-sm">
			<span class="text-ink/75">
				{stamp_age === null
					? 'your figures have never been dated, so investors see them as unconfirmed.'
					: `your figures were last confirmed ${stamp_age} days ago and are sinking down the homepage.`}
			</span>
			<form method="POST" action="/{p.g}/edit?/confirm" use:enhance>
				<button
					type="submit"
					class="rounded-full bg-cobalt px-4 py-2 text-xs font-medium text-white hover:bg-cobalt/90"
				>
					still accurate
				</button>
			</form>
			<a href="/{p.g}/edit" class="text-cobalt hover:underline">or update them</a>
		</div>
	{/if}

	<div class="mt-8 grid gap-x-10 gap-y-12 lg:grid-cols-12">
		<article class="lg:col-span-8">
			<div class="h-52 w-full overflow-hidden rounded-lg border border-ink/10 md:h-80">
				{#if p.ci}
					<img src={p.ci} alt="" loading="lazy" class="h-full w-full object-cover" />
				{:else}
					<div
						class="flex h-full w-full items-center justify-center {sector_color[p.c] ?? 'bg-cobalt'}"
					>
						<span class="font-display text-7xl font-semibold text-white/90">{p.n.slice(0, 1)}</span>
					</div>
				{/if}
			</div>

			<div class="mt-6 flex flex-wrap items-center gap-3">
				<span class="font-mono text-xs tracking-[0.16em] text-cobalt uppercase">{sector_name}</span>
				<StatusPill r={p.r} />
				{#if is_owner}
					<a href="/{p.g}/edit" class="ml-auto text-sm text-cobalt hover:underline">edit your page</a>
				{/if}
			</div>

			<h1 class="mt-4 font-display text-4xl font-semibold tracking-tight text-ink md:text-5xl">
				{p.n}
			</h1>
			<p class="mt-4 text-lg leading-relaxed text-ink/70">{p.o}</p>

			{#if hd || p.sg || (p.ra === 'y' && current)}
				<div class="mt-10 flex flex-wrap items-end gap-x-12 gap-y-6">
					{#if hd}
						<div>
							<div
								class="tnum font-display text-5xl font-semibold {current ? 'text-ink' : 'text-ink/40'}"
							>
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

			{#if detail || p.h}
				<section class="mt-14">
					<h2 class="font-display text-2xl font-semibold tracking-tight text-ink">project overview</h2>
					<div class="mt-4 flex flex-col gap-4 text-ink/75">
						{#if detail}<p>{detail}</p>{/if}
						{#if p.h}<p>{p.h}</p>{/if}
					</div>
				</section>
			{/if}

			{#if shots.length}
				<section class="mt-14">
					<h2 class="font-display text-2xl font-semibold tracking-tight text-ink">system previews</h2>
					<div class="mt-4 grid gap-4 sm:grid-cols-2">
						{#each shots as s (s)}
							<div class="h-48 overflow-hidden rounded-lg border border-ink/10">
								<img src={s} alt="" loading="lazy" class="h-full w-full object-cover" />
							</div>
						{/each}
					</div>
				</section>
			{/if}

			<section class="mt-14">
				<h2 class="font-display text-2xl font-semibold tracking-tight text-ink">the numbers</h2>
				{#if cards.length}
					<ul class="mt-4 flex flex-col gap-3">
						{#each cards as c (c.l)}
							<li class="flex gap-4 rounded-lg border border-ink/10 p-4">
								<span class="mt-0.5 text-cobalt"><Icon n={c.icon} /></span>
								<div>
									<div class="tnum font-display text-lg font-medium text-ink">{c.v}</div>
									<div class="text-sm text-ink/60">{c.l}</div>
								</div>
							</li>
						{/each}
					</ul>
					<p class="mt-4 text-xs text-ink/60">figures provided by the builder</p>
				{:else if is_owner}
					<p class="mt-3 text-ink/60">
						no numbers added yet. <a href="/{p.g}/edit" class="text-cobalt hover:underline">add them</a>
					</p>
				{:else}
					<p class="mt-3 text-ink/60">no numbers shared yet.</p>
				{/if}
			</section>

			{#if p.x}
				<section class="mt-14">
					<h2 class="font-display text-2xl font-semibold tracking-tight text-ink">
						what we haven't cracked yet
					</h2>
					<p class="mt-4 text-ink/75">{p.x}</p>
				</section>
			{/if}

			{#if p.ev || p.vd}
				<section class="mt-14 rounded-lg border border-ink/10 p-6">
					<h2 class="font-display text-lg font-medium text-ink">what devcircles checked</h2>
					{#if p.ev}<p class="mt-2 text-ink/75">{p.ev}</p>{/if}
					{#if p.vd}<p class="mt-2 text-xs text-ink/50">link last checked {p.vd}</p>{/if}
					<p class="mt-4 text-xs text-ink/60">
						devcircles checks that a link works and what the product publicly offers. figures above
						come from the builder unless marked verified.
					</p>
				</section>
			{/if}
		</article>

		<aside class="lg:col-span-4">
			{#if links.length}
				<div class="flex flex-col gap-3 rounded-lg bg-cobalt/5 p-5">
					{#each links as l (l.href)}
						<a
							href={l.href}
							target="_blank"
							rel="noopener"
							class="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-medium {l.primary
								? 'bg-cobalt text-white hover:bg-cobalt/90'
								: 'border border-ink/15 text-ink hover:border-cobalt/40'}"
						>
							<Icon n={l.icon} c="h-4 w-4" />
							{l.label}
						</a>
					{/each}
				</div>
			{/if}

			<div class="mt-6 flex flex-col gap-6 rounded-lg border border-ink/10 p-5">
				{#if stack.length}
					<div>
						<h3 class="font-mono text-xs tracking-[0.16em] text-cobalt uppercase">tech stack</h3>
						<div class="mt-3 flex flex-wrap gap-2">
							{#each stack as s (s)}
								<span class="rounded-full border border-ink/10 bg-ink/5 px-3 py-1 text-xs text-ink/75"
									>{s}</span
								>
							{/each}
						</div>
					</div>
				{/if}

				{#if b.n || p.fp}
					<div class={stack.length ? 'border-t border-ink/10 pt-6' : ''}>
						<h3 class="font-mono text-xs tracking-[0.16em] text-cobalt uppercase">project lead</h3>
						<div class="mt-3 flex items-center gap-3">
							{#if p.fp}
								<img src={p.fp} alt="" loading="lazy" class="h-12 w-12 rounded-full object-cover" />
							{/if}
							<div>
								<div class="font-display font-medium text-ink">{b.n}</div>
								{#if b.r}<div class="text-sm text-ink/60">{b.r}</div>{/if}
							</div>
						</div>
						{#if contacts.length}
							<dl class="mt-4 flex flex-col gap-2 text-sm">
								{#each contacts as c (c.k)}
									<div class="flex gap-2">
										<dt class="text-ink/50">{c.k}</dt>
										<dd class="min-w-0 truncate">
											{#if c.href}
												<a
													href={c.href}
													class="text-cobalt hover:underline"
													target="_blank"
													rel="noopener">{c.v}</a
												>
											{:else}
												{c.v}
											{/if}
										</dd>
									</div>
								{/each}
							</dl>
						{/if}
					</div>
				{/if}

				<div class={stack.length || b.n || p.fp ? 'border-t border-ink/10 pt-6' : ''}>
					<h3 class="font-mono text-xs tracking-[0.16em] text-cobalt uppercase">community</h3>
					<p class="mt-3 flex items-center gap-2 text-ink">
						<span class="text-cobalt"><Icon n="group" c="h-4 w-4" /></span>
						{sector_name}
					</p>
					{#if place || b.c}
						<p class="mt-2 flex items-center gap-2 text-sm text-ink/60">
							<span class="text-cobalt"><Icon n="pin" c="h-4 w-4" /></span>
							{[b.c, place].filter(Boolean).join(' · ')}
						</p>
					{/if}
				</div>
			</div>

			{#if rel.length}
				<div class="mt-6">
					<h3 class="font-display text-lg font-medium text-ink">related projects</h3>
					<div class="mt-3 flex flex-col gap-3">
						{#each rel as r (r.g)}
							<a
								href="/{r.g}"
								class="flex items-center gap-3 rounded-lg border border-ink/10 p-3 hover:border-cobalt/40"
							>
								<span
									class="flex h-9 w-9 shrink-0 items-center justify-center rounded {sector_color[r.c] ??
										'bg-cobalt'}"
								>
									<span class="font-display text-sm font-semibold text-white">{r.n.slice(0, 1)}</span>
								</span>
								<span class="min-w-0">
									<span class="block truncate font-medium text-ink">{r.n}</span>
									<span class="block truncate text-xs text-ink/60">{r.o}</span>
								</span>
							</a>
						{/each}
					</div>
				</div>
			{/if}
		</aside>
	</div>

	{#if data.can_msg}
		<MessageBuilder pg={p.g} who={b.n ?? ''} signed_in={!!data.u} />
	{/if}

	<Interest pg={p.g} direct={b.e ?? ''} />

	{#if is_owner && asks.length}
		<div class="mt-8 rounded-lg border border-teal-brand/30 p-6">
			<h2 class="font-display text-lg font-medium text-ink">
				{asks.length}
				{asks.length === 1 ? 'person has' : 'people have'} asked about this
			</h2>
			<ul class="mt-4 flex flex-col gap-4">
				{#each asks as a (a.em + a.j)}
					<li class="text-sm">
						<a href="mailto:{a.em}" class="text-cobalt hover:underline">{a.nm.toLowerCase()}</a>
						{#if a.fm}<span class="text-ink/60"> · {a.fm.toLowerCase()}</span>{/if}
						{#if a.ms}<p class="mt-1 text-ink/75">{a.ms}</p>{/if}
					</li>
				{/each}
			</ul>
		</div>
	{/if}

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
