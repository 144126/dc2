<script lang="ts">
	import type { PageData } from './$types';
	import { ctrl_enter } from '$lib/ctrl_enter';
	import Icon from '$lib/icon.svelte';
	import type { Msg } from '$lib/chat';

	let { data }: { data: PageData } = $props();

	let msgs = $state<Msg[]>([]);
	let text = $state('');
	let busy = $state(false);
	let err = $state('');
	let form: HTMLFormElement;

	$effect(() => {
		msgs = [...(data.msgs as Msg[])];
	});

	$effect(() => {
		const tick = setInterval(async () => {
			const after = msgs.length ? msgs[msgs.length - 1].md : 0;
			const r = await fetch(`/api/msg?id=${data.id}&after=${after}`);
			if (!r.ok) return;
			const { m } = (await r.json()) as { m: Msg[] };
			if (m.length) msgs = [...msgs, ...m];
		}, 5000);
		return () => clearInterval(tick);
	});

	async function send() {
		if (busy || !text.trim()) return;
		busy = true;
		err = '';
		try {
			const r = await fetch('/api/msg', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ id: data.id, x: text })
			});
			if (!r.ok) throw new Error((await r.text()) || 'that did not send');
			const { m } = (await r.json()) as { m: Msg };
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
</script>

<svelte:head>
	<title>{data.who} — devcircles</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto max-w-3xl px-6 py-16">
	<a href="/inbox" class="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-cobalt">
		<Icon n="back" c="h-4 w-4" /> inbox
	</a>

	<h1 class="mt-4 font-display text-2xl font-semibold tracking-tight text-ink">{data.who}</h1>
	{#if data.pn}
		<p class="mt-1 text-sm text-ink/60">
			about <a href="/{data.pg}" class="text-cobalt hover:underline">{data.pn.toLowerCase()}</a>
		</p>
	{/if}

	<ul class="mt-10 flex flex-col gap-4">
		{#each msgs as m (m.md + m.mf)}
			<li class="flex {m.mf === data.me ? 'justify-end' : 'justify-start'}">
				<div
					class="max-w-[80%] rounded-lg px-4 py-3 {m.mf === data.me
						? 'bg-cobalt text-white'
						: 'border border-ink/10 text-ink'}"
				>
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

	<form
		bind:this={form}
		use:ctrl_enter={() => form.requestSubmit()}
		onsubmit={(ev) => {
			ev.preventDefault();
			send();
		}}
		class="mt-10 flex flex-col gap-3"
	>
		<textarea
			bind:value={text}
			rows="3"
			placeholder="write a message"
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
</div>
