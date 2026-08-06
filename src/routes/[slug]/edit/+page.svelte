<script lang="ts">
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import SectorPicker from '$lib/sector_picker.svelte';
	import { sector_info } from '$lib/sectors';
	import { stage_label } from '$lib/investor';
	import { ctrl_enter } from '$lib/ctrl_enter';
	let { data }: { data: PageData } = $props();
	const p = $derived(data.p as Record<string, string> & { b?: Record<string, string> });
	const b = $derived(p.b ?? {});
	let rev = $state(p.m ?? '');
	let raising = $state(p.ra ?? '');
	let save_form: HTMLFormElement;
</script>

<svelte:head>
	<title>edit {p.n} — devcircles</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-6 py-16">
	<h1 class="font-display text-3xl font-semibold tracking-tight text-ink">edit {p.n}</h1>
	<p class="mt-3 text-ink/60">the product name is fixed since the page url is derived from it.</p>

	<form
		method="POST"
		action="?/save"
		use:enhance
		use:ctrl_enter={() => save_form.requestSubmit()}
		bind:this={save_form}
		class="mt-10 flex flex-col gap-8"
	>
		<div class="flex flex-col gap-4">
			<h2 class="text-sm font-semibold tracking-wide text-cobalt uppercase">about the product</h2>
			<SectorPicker name="c" value={p.c} label={p.cn ?? sector_info[p.c]?.n ?? ''} />
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				product link
				<input name="u" type="url" value={p.u} class="rounded-md border border-ink/20 px-3 py-2" />
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				one-liner
				<textarea name="o" rows="2" class="rounded-md border border-ink/20 px-3 py-2"
					>{p.o}</textarea
				>
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				what it does (more detail, optional)
				<textarea name="w" rows="3" class="rounded-md border border-ink/20 px-3 py-2"
					>{p.w}</textarea
				>
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				why it matters
				<textarea name="h" rows="3" class="rounded-md border border-ink/20 px-3 py-2"
					>{p.h}</textarea
				>
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				where it can grow
				<textarea name="x" rows="3" class="rounded-md border border-ink/20 px-3 py-2"
					>{p.x}</textarea
				>
			</label>
		</div>

		<div class="flex flex-col gap-4">
			<h2 class="text-sm font-semibold tracking-wide text-cobalt uppercase">builder contact</h2>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				name
				<input name="y" value={b.n} class="rounded-md border border-ink/20 px-3 py-2" />
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				email (only shown publicly if you check the box below)
				<input name="e" type="email" value={b.e} class="rounded-md border border-ink/20 px-3 py-2" />
			</label>
			<label class="flex items-center gap-2 text-sm text-ink/70">
				<input type="checkbox" name="pe" checked={!!b.e} />
				show my email publicly on this page
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				phone (shown publicly)
				<input name="p" value={b.p} class="rounded-md border border-ink/20 px-3 py-2" />
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				linkedin
				<input name="i" value={b.l} class="rounded-md border border-ink/20 px-3 py-2" />
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				location
				<input name="v" value={b.c} class="rounded-md border border-ink/20 px-3 py-2" />
			</label>
		</div>

		<div class="flex flex-col gap-4">
			<h2 class="text-sm font-semibold tracking-wide text-cobalt uppercase">metrics</h2>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				launch date
				<input name="d" type="date" value={p.d} class="rounded-md border border-ink/20 px-3 py-2" />
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				users / signups / downloads
				<input
					name="q"
					type="number"
					min="0"
					value={p.q}
					class="rounded-md border border-ink/20 px-3 py-2"
				/>
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				making revenue?
				<select name="m" bind:value={rev} class="rounded-md border border-ink/20 px-3 py-2">
					<option value="">prefer not to say</option>
					<option value="y">yes</option>
					<option value="n">no</option>
				</select>
			</label>
			{#if rev === 'y'}
				<label class="flex flex-col gap-1 text-sm text-ink/70">
					monthly revenue (₦)
					<input
						name="a"
						type="number"
						min="0"
						value={p.a}
						class="rounded-md border border-ink/20 px-3 py-2"
					/>
				</label>
			{/if}
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				team size
				<input
					name="z"
					type="number"
					min="0"
					value={p.z}
					class="rounded-md border border-ink/20 px-3 py-2"
				/>
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				proudest metric
				<input name="k" value={p.k} class="rounded-md border border-ink/20 px-3 py-2" />
			</label>
		</div>

		<div class="flex flex-col gap-4">
			<h2 class="text-sm font-semibold tracking-wide text-cobalt uppercase">for investors</h2>
			<p class="text-sm text-ink/60">
				this is the part investors read first. one real number beats three paragraphs.
			</p>
			<p class="text-sm text-ink/60">
				whatever you put here is stamped with today's date and shown with it. it keeps full weight for
				three months, half for three more, then stops counting until you confirm it.
			</p>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				headline number
				<input name="hm" value={p.hm} placeholder="2,400 · or: first 1,000 paying users" class="rounded-md border border-ink/20 px-3 py-2" />
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				what that number is
				<input name="hl" value={p.hl} placeholder="paying customers" class="rounded-md border border-ink/20 px-3 py-2" />
				<span class="text-xs text-ink/50">
					milestones age better than totals. "first ₦1m month, august 2026" stays true; "₦1m a month"
					stops being true the month it changes.
				</span>
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				stage
				<select name="sg" value={p.sg} class="rounded-md border border-ink/20 px-3 py-2">
					<option value="">prefer not to say</option>
					{#each Object.entries(stage_label) as [k, v] (k)}
						<option value={k}>{v}</option>
					{/each}
				</select>
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				raising right now?
				<select name="ra" bind:value={raising} class="rounded-md border border-ink/20 px-3 py-2">
					<option value="">prefer not to say</option>
					<option value="y">yes</option>
					<option value="n">no</option>
				</select>
			</label>
			{#if raising === 'y'}
				<label class="flex flex-col gap-1 text-sm text-ink/70">
					how much you are raising
					<input name="rt" value={p.rt} placeholder="₦80m seed" class="rounded-md border border-ink/20 px-3 py-2" />
				</label>
			{/if}
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				photo of you (link)
				<input name="fp" type="url" value={p.fp} placeholder="https://" class="rounded-md border border-ink/20 px-3 py-2" />
				<span class="text-xs text-ink/50">investors back people. a face doubles the odds anyone reads the rest.</span>
			</label>
		</div>

		<div class="flex items-center gap-4">
			<button
				type="submit"
				class="rounded-full bg-cobalt px-6 py-3 text-sm font-medium text-white hover:bg-cobalt/90"
			>
				save changes
			</button>
			<a href="/{p.g}" class="text-sm text-ink/60 hover:underline">cancel</a>
		</div>
	</form>

	<form method="POST" action="?/del" use:enhance class="mt-16 rounded-lg border border-coral/30 p-6">
		<h2 class="text-sm font-semibold tracking-wide text-coral uppercase">remove this product</h2>
		<p class="mt-2 text-sm text-ink/60">this permanently deletes the page. it cannot be undone.</p>
		<label class="mt-4 flex items-center gap-2 text-sm text-ink/70">
			<input type="checkbox" name="confirm" required />
			yes, permanently remove this page
		</label>
		<button
			type="submit"
			class="mt-4 rounded-full bg-coral px-6 py-3 text-sm font-medium text-white hover:bg-coral/90"
		>
			delete product
		</button>
	</form>
</div>
