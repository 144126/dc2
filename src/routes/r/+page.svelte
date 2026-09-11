<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { enhance } from '$app/forms';
	import { ctrl_enter } from '$lib/ctrl_enter';
	import Icon from '$lib/icon.svelte';
	import { in_room } from '$lib/room';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let search_form: HTMLFormElement | undefined = $state();
	let make_form: HTMLFormElement | undefined = $state();
	let making = $state(false);

	const when = (md: number) =>
		md
			? new Date(md).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
			: '';
</script>

<svelte:head>
	<title>rooms — devcircles</title>
	<meta
		name="description"
		content="join a room around a topic, a city, or a stack. or start one."
	/>
	<link rel="canonical" href="https://devcircles.apexlinks.org/r" />
</svelte:head>

<div class="mx-auto max-w-3xl px-6 py-16">
	<p class="font-mono text-xs tracking-[0.16em] text-cobalt uppercase">community</p>
	<h1 class="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">rooms</h1>
	<p class="mt-3 text-ink/60">
		subcommunities anyone can join. search a topic, or start the room you wish existed.
	</p>

	<form
		method="GET"
		bind:this={search_form}
		use:ctrl_enter={() => search_form?.requestSubmit()}
		class="mt-8 flex items-center gap-3"
	>
		<div class="flex flex-1 items-center gap-2 rounded-full border border-ink/20 px-4 py-2">
			<Icon n="search" c="h-4 w-4 text-ink/40" />
			<input
				name="q"
				value={data.q}
				placeholder="fintech, rust, abuja"
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

	{#if data.signed_in}
		<div class="mt-10">
			<button
				type="button"
				onclick={() => (making = !making)}
				class="inline-flex items-center gap-2 rounded-full border border-ink/20 px-5 py-2 text-sm font-medium text-ink hover:border-cobalt/50"
			>
				<Icon n="plus" c="h-4 w-4" />
				start a room
			</button>
			{#if making}
				<form
					method="POST"
					action="?/create"
					use:enhance
					use:ctrl_enter={() => make_form?.requestSubmit()}
					bind:this={make_form}
					class="mt-6 flex flex-col gap-4 rounded-lg border border-ink/10 p-6"
				>
					<label class="flex flex-col gap-1 text-sm text-ink/70">
						name
						<input
							name="nm"
							value={form?.nm ?? ''}
							maxlength="60"
							class="rounded-md border border-ink/20 px-3 py-2"
						/>
					</label>
					<label class="flex flex-col gap-1 text-sm text-ink/70">
						what this room is about
						<textarea
							name="ds"
							rows="3"
							class="rounded-md border border-ink/20 px-3 py-2">{form?.ds ?? ''}</textarea
						>
					</label>
					<label class="flex flex-col gap-1 text-sm text-ink/70">
						tags
						<input
							name="tg"
							value={form?.tg ?? ''}
							placeholder="payments, rust"
							class="rounded-md border border-ink/20 px-3 py-2"
						/>
					</label>
					{#if form?.why}<p class="text-xs text-coral">{form.why}</p>{/if}
					<button
						type="submit"
						class="self-start rounded-full bg-cobalt px-6 py-3 text-sm font-medium text-white hover:bg-cobalt/90"
					>
						create room
					</button>
				</form>
			{/if}
		</div>
	{:else}
		<p class="mt-8 text-sm text-ink/60">
			<a href="/google?next=/r" data-sveltekit-reload class="text-cobalt hover:underline">sign in</a>
			to start a room.
		</p>
	{/if}

	<div class="mt-12">
		<h2 class="font-mono text-xs tracking-[0.16em] text-cobalt uppercase">
			{data.rooms.length}
			{data.rooms.length === 1 ? 'room' : 'rooms'}
		</h2>
		{#if data.rooms.length}
			<ul class="mt-4 flex flex-col gap-3">
				{#each data.rooms as r (r.hn)}
					<li>
						<a
							href="/r/{r.hn}"
							class="flex items-start gap-4 rounded-lg border border-ink/10 p-4 hover:border-cobalt/40"
						>
							<span class="mt-1 text-ink/40"><Icon n="group" /></span>
							<span class="min-w-0 flex-1">
								<span class="flex flex-wrap items-baseline gap-x-3">
									<span class="font-display font-medium text-ink">{r.nm}</span>
									<span class="text-xs text-ink/50">{r.mb.length} in the room</span>
									{#if data.me && in_room(r, data.me)}
										<span class="text-xs text-cobalt">joined</span>
									{/if}
									{#if r.md}<span class="ml-auto text-xs text-ink/50">{when(r.md)}</span>{/if}
								</span>
								{#if r.ds}<span class="mt-1 block text-sm text-ink/70">{r.ds}</span>{/if}
								{#if r.mx}<span class="mt-1 block truncate text-sm text-ink/50">{r.mx}</span>{/if}
								{#if r.tg.length}
									<span class="mt-2 flex flex-wrap gap-2">
										{#each r.tg as t (t)}
											<span class="rounded-full border border-ink/10 px-2 py-0.5 text-xs text-ink/50"
												>{t}</span
											>
										{/each}
									</span>
								{/if}
							</span>
						</a>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="mt-3 text-ink/60">
				{#if data.q}
					nothing matched. start the room yourself.
				{:else}
					no rooms yet. be the first.
				{/if}
			</p>
		{/if}
	</div>
</div>
