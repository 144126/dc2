<script lang="ts">
	import type { PageData } from './$types';
	import { ctrl_enter } from '$lib/ctrl_enter';
	import Icon from '$lib/icon.svelte';

	let { data }: { data: PageData } = $props();
	let form: HTMLFormElement;

	const when = (md: number) =>
		new Date(md).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
</script>

<svelte:head>
	<title>inbox — devcircles</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto max-w-3xl px-6 py-16">
	<h1 class="font-display text-3xl font-semibold tracking-tight text-ink">inbox</h1>
	<p class="mt-3 text-ink/60">
		every conversation you are in. search reads the words of every message across all of them.
	</p>

	<form
		method="GET"
		bind:this={form}
		use:ctrl_enter={() => form.requestSubmit()}
		class="mt-8 flex items-center gap-3"
	>
		<div class="flex flex-1 items-center gap-2 rounded-full border border-ink/20 px-4 py-2">
			<Icon n="search" c="h-4 w-4 text-ink/40" />
			<input
				name="q"
				value={data.q}
				placeholder="search every chat"
				onkeydown={(ev) => {
					if (ev.key === 'Enter' && !(ev.ctrlKey || ev.metaKey)) ev.preventDefault();
				}}
				class="w-full bg-transparent text-sm outline-none"
			/>
		</div>
		<button
			type="submit"
			class="rounded-full bg-cobalt px-5 py-2.5 text-sm font-medium text-white hover:bg-cobalt/90"
		>
			search
		</button>
	</form>
	<p class="mt-2 text-xs text-ink/50">ctrl+enter searches</p>

	{#if data.q}
		<div class="mt-10">
			<h2 class="font-mono text-xs tracking-[0.16em] text-cobalt uppercase">
				{data.hits.length}
				{data.hits.length === 1 ? 'message' : 'messages'} matching "{data.q}"
			</h2>
			{#if data.hits.length}
				<ul class="mt-4 flex flex-col gap-3">
					{#each data.hits as h (h.id + h.md)}
						<li>
							<a
								href="/inbox/{h.id}"
								class="block rounded-lg border border-ink/10 p-4 hover:border-cobalt/40"
							>
								<div class="flex flex-wrap items-baseline gap-x-3 text-xs text-ink/50">
									<span>{h.mine ? 'you' : h.who}</span>
									{#if h.pn}<span>· about {h.pn.toLowerCase()}</span>{/if}
									<span class="ml-auto">{when(h.md)}</span>
								</div>
								<p class="mt-1 text-sm text-ink/80">{h.mx}</p>
							</a>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="mt-3 text-ink/60">nothing matched. try one word instead of a phrase.</p>
			{/if}
			<a href="/inbox" class="mt-6 inline-block text-sm text-cobalt hover:underline">clear search</a>
		</div>
	{/if}

	<div class="mt-12">
		<h2 class="font-mono text-xs tracking-[0.16em] text-cobalt uppercase">conversations</h2>
		{#if data.rows.length}
			<ul class="mt-4 flex flex-col gap-3">
				{#each data.rows as r (r.id)}
					<li>
						<a
							href="/inbox/{r.id}"
							class="flex items-start gap-4 rounded-lg border border-ink/10 p-4 hover:border-cobalt/40"
						>
							<span class="mt-1 text-ink/40"><Icon n="chat" /></span>
							<span class="min-w-0 flex-1">
								<span class="flex flex-wrap items-baseline gap-x-3">
									<span class="font-display font-medium text-ink">{r.who}</span>
									{#if r.pn}<span class="text-xs text-ink/50">about {r.pn.toLowerCase()}</span>{/if}
									<span class="ml-auto text-xs text-ink/50">{when(r.md)}</span>
								</span>
								<span class="mt-1 block truncate text-sm text-ink/70">{r.mx}</span>
							</span>
							{#if r.un}
								<span class="rounded-full bg-cobalt px-2 py-0.5 text-[10px] font-medium text-white"
									>{r.un}</span
								>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="mt-3 text-ink/60">
				no conversations yet. open any product and message the builder to start one.
			</p>
		{/if}
	</div>
</div>
