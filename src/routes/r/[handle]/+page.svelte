<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import { ctrl_enter } from '$lib/ctrl_enter';
	import Icon from '$lib/icon.svelte';
	import { in_room, type Rmsg } from '$lib/room';
	import { href, label } from '$lib/who';

	let { data }: { data: PageData } = $props();

	let msgs = $state<Rmsg[]>([]);
	let text = $state('');
	let busy = $state(false);
	let err = $state('');
	let form: HTMLFormElement | undefined = $state();

	const mine = $derived(!!data.me && in_room(data.r, data.me));
	const owner = $derived(!!data.me && data.r.ow === data.me);

	$effect(() => {
		msgs = [...data.msgs];
	});

	$effect(() => {
		if (!mine) return;
		const tick = setInterval(async () => {
			const after = msgs.length ? msgs[msgs.length - 1].md : 0;
			const r = await fetch(`/api/rmsg?hn=${data.r.hn}&after=${after}`);
			if (!r.ok) return;
			const { m } = (await r.json()) as { m: Rmsg[] };
			if (m.length) msgs = [...msgs, ...m];
		}, 5000);
		return () => clearInterval(tick);
	});

	async function send() {
		if (busy || !text.trim()) return;
		busy = true;
		err = '';
		try {
			const r = await fetch('/api/rmsg', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ hn: data.r.hn, x: text })
			});
			if (!r.ok) throw new Error((await r.text()) || 'that did not send');
			const { m } = (await r.json()) as { m: Rmsg };
			msgs = [...msgs, m];
			text = '';
		} catch (e) {
			err = e instanceof Error ? e.message : 'that did not send';
		} finally {
			busy = false;
		}
	}

	const when = (md: number) =>
		new Date(md).toLocaleString('en-GB', {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});

	const who = (e: string) => label(data.names[e], e);
	const to = (e: string) => href(data.names[e]);
</script>

<svelte:head>
	<title>{data.r.nm} — rooms — devcircles</title>
	<meta name="description" content={data.r.ds || `a room on devcircles called ${data.r.nm}.`} />
	<link rel="canonical" href="https://devcircles.apexlinks.org/r/{data.r.hn}" />
</svelte:head>

<div class="mx-auto max-w-3xl px-6 py-16">
	<a href="/r" class="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-cobalt">
		<Icon n="back" c="h-4 w-4" /> rooms
	</a>

	<div class="mt-4 flex flex-wrap items-start justify-between gap-4">
		<div>
			<h1 class="font-display text-2xl font-semibold tracking-tight text-ink">{data.r.nm}</h1>
			<p class="mt-1 text-sm text-ink/50">/{data.r.hn} · {data.r.mb.length} in the room</p>
			{#if data.r.ds}<p class="mt-3 text-ink/70">{data.r.ds}</p>{/if}
			{#if data.r.tg.length}
				<div class="mt-3 flex flex-wrap gap-2">
					{#each data.r.tg as t (t)}
						<a
							href="/r?q={encodeURIComponent(t)}"
							class="rounded-full border border-ink/10 px-2 py-0.5 text-xs text-ink/50 hover:border-cobalt/40"
							>{t}</a
						>
					{/each}
				</div>
			{/if}
		</div>
		{#if data.signed_in}
			{#if owner}
				<p class="text-xs text-ink/50">you started this room</p>
			{:else if mine}
				<form method="POST" action="?/leave" use:enhance>
					<button type="submit" class="text-sm text-ink/60 hover:text-coral">leave</button>
				</form>
			{:else}
				<form method="POST" action="?/join" use:enhance>
					<button
						type="submit"
						class="rounded-full bg-cobalt px-5 py-2 text-sm font-medium text-white hover:bg-cobalt/90"
					>
						join
					</button>
				</form>
			{/if}
		{:else}
			<a
				href="/google?next=/r/{data.r.hn}"
				data-sveltekit-reload
				class="rounded-full bg-cobalt px-5 py-2 text-sm font-medium text-white hover:bg-cobalt/90"
			>
				sign in to join
			</a>
		{/if}
	</div>

	{#if owner}
		<form
			method="POST"
			action="?/edit"
			use:enhance
			class="mt-8 flex flex-col gap-3 rounded-lg border border-ink/10 p-6"
		>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				name
				<input name="nm" value={data.r.nm} maxlength="60" class="rounded-md border border-ink/20 px-3 py-2" />
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				what this room is about
				<textarea name="ds" rows="3" class="rounded-md border border-ink/20 px-3 py-2">{data.r.ds}</textarea>
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				tags
				<input name="tg" value={data.r.tg.join(', ')} class="rounded-md border border-ink/20 px-3 py-2" />
			</label>
			<div class="flex items-center gap-4">
				<button
					type="submit"
					class="rounded-full bg-cobalt px-5 py-2 text-sm font-medium text-white hover:bg-cobalt/90"
				>
					save room
				</button>
			</div>
		</form>
		<form method="POST" action="?/drop" use:enhance class="mt-3">
			<button type="submit" class="text-sm text-ink/50 hover:text-coral">delete this room</button>
		</form>
	{/if}

	<ul class="mt-10 flex flex-col gap-3 text-sm text-ink/60">
		{#each data.r.mb as e (e)}
			<li>
				{#if to(e)}
					<a href={to(e)} class="text-cobalt hover:underline">{who(e)}</a>
				{:else}
					{who(e)}
				{/if}
				{#if e === data.r.ow}<span class="text-ink/40"> · started it</span>{/if}
			</li>
		{/each}
	</ul>

	<ul class="mt-10 flex flex-col gap-4">
		{#each msgs as m (m.md + m.mf)}
			<li class="flex {m.mf === data.me ? 'justify-end' : 'justify-start'}">
				<div
					class="max-w-[80%] rounded-lg px-4 py-3 {m.mf === data.me
						? 'bg-cobalt text-white'
						: 'border border-ink/10 text-ink'}"
				>
					{#if m.mf !== data.me}
						<p class="mb-1 text-[11px] {m.mf === data.me ? 'text-white/70' : 'text-ink/50'}">
							{#if to(m.mf)}
								<a href={to(m.mf)} class="hover:underline">{who(m.mf)}</a>
							{:else}
								{who(m.mf)}
							{/if}
						</p>
					{/if}
					<p class="text-sm whitespace-pre-wrap">{m.mx}</p>
					<p class="mt-1 text-[10px] {m.mf === data.me ? 'text-white/60' : 'text-ink/40'}">
						{when(m.md)}
					</p>
				</div>
			</li>
		{/each}
	</ul>

	{#if !msgs.length}
		<p class="mt-6 text-ink/60">no messages yet. say the first thing.</p>
	{/if}

	{#if mine}
		<form
			bind:this={form}
			use:ctrl_enter={() => form?.requestSubmit()}
			onsubmit={(ev) => {
				ev.preventDefault();
				send();
			}}
			class="mt-10 flex flex-col gap-3"
		>
			<textarea
				bind:value={text}
				rows="3"
				placeholder="say something to the room"
				class="rounded-md border border-ink/20 px-3 py-2 text-sm"
			></textarea>
			{#if err}<p class="text-xs text-coral">{err}</p>{/if}
			<div class="flex items-center gap-4">
				<button
					type="submit"
					disabled={busy}
					class="inline-flex items-center gap-2 rounded-full bg-cobalt px-6 py-3 text-sm font-medium text-white hover:bg-cobalt/90 disabled:opacity-50"
				>
					<Icon n="send" c="h-4 w-4" />
					{busy ? 'sending…' : 'send'}
				</button>
				<span class="text-xs text-ink/50">ctrl+enter sends</span>
			</div>
		</form>
	{:else if data.signed_in}
		<p class="mt-10 text-sm text-ink/60">join the room to post.</p>
	{/if}
</div>
