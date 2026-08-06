<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { enhance } from '$app/forms';
	import SectorPicker from '$lib/sector_picker.svelte';
	import { stage_label } from '$lib/investor';
	import { ctrl_enter } from '$lib/ctrl_enter';
	let { form, data }: { form: ActionData; data: PageData } = $props();
	const err = (k: string) => (form as { errs?: Record<string, string> } | null)?.errs?.[k];
	const val = (k: string) => (form as { values?: Record<string, string> } | null)?.values?.[k] ?? '';

	let rev = $state('');
	let raising = $state('');
	let submit_form: HTMLFormElement;

	const states = [
		'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
		'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe',
		'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
		'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
		'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT (Abuja)'
	];
</script>

<svelte:head>
	<title>submit your product — devcircles</title>
</svelte:head>

<div class="mx-auto max-w-2xl px-6 py-16">
	<h1 class="font-display text-3xl font-semibold tracking-tight text-ink">
		built something? add it to the report
	</h1>
	<p class="mt-3 text-ink/60">
		fields marked * are required. everything else can come later.
	</p>

	<form
		method="POST"
		use:enhance
		use:ctrl_enter={() => submit_form.requestSubmit()}
		bind:this={submit_form}
		class="mt-10 flex flex-col gap-8"
	>
		<div class="flex flex-col gap-4">
			<h2 class="text-sm font-semibold tracking-wide text-cobalt uppercase">about you</h2>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				your name
				<input name="y" value={val('y')} class="rounded-md border border-ink/20 px-3 py-2" />
			</label>
			<p class="text-sm text-ink/60">signed in as {data.u.e}</p>
			<label class="flex items-center gap-2 text-sm text-ink/70">
				<input type="checkbox" name="pe" />
				show my email publicly on the product page
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				location
				<select name="v" class="rounded-md border border-ink/20 px-3 py-2">
					<option value="">select state</option>
					{#each states as s}
						<option value={s} selected={val('v') === s}>{s}</option>
					{/each}
				</select>
			</label>
		</div>

		<div class="flex flex-col gap-4">
			<h2 class="text-sm font-semibold tracking-wide text-cobalt uppercase">about the product</h2>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				product name*
				<input name="n" required value={val('n')} class="rounded-md border border-ink/20 px-3 py-2" />
				{#if err('n')}<span class="text-xs text-coral">{err('n')}</span>{/if}
			</label>
			<SectorPicker name="c" value={val('c')} label={val('cn')} />
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				product link*
				<input
					name="u"
					type="url"
					required
					placeholder="https://"
					value={val('u')}
					class="rounded-md border border-ink/20 px-3 py-2"
				/>
				{#if err('u')}<span class="text-xs text-coral">{err('u')}</span>{/if}
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				short description*
				<textarea name="o" rows="3" required class="rounded-md border border-ink/20 px-3 py-2"
					>{val('o')}</textarea
				>
				{#if err('o')}<span class="text-xs text-coral">{err('o')}</span>{/if}
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				what it does (more detail, optional)
				<textarea name="w" rows="3" class="rounded-md border border-ink/20 px-3 py-2"
					>{val('w')}</textarea
				>
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				why it matters (optional)
				<textarea name="h" rows="3" class="rounded-md border border-ink/20 px-3 py-2"
					>{val('h')}</textarea
				>
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				where it can grow (optional)
				<textarea name="x" rows="3" class="rounded-md border border-ink/20 px-3 py-2"
					>{val('x')}</textarea
				>
			</label>
		</div>

		<div class="flex flex-col gap-4">
			<h2 class="text-sm font-semibold tracking-wide text-cobalt uppercase">metrics (optional)</h2>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				launch date
				<input name="d" type="date" value={val('d')} class="rounded-md border border-ink/20 px-3 py-2" />
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				users / signups / downloads
				<input
					name="q"
					type="number"
					min="0"
					value={val('q')}
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
						value={val('a')}
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
					value={val('z')}
					class="rounded-md border border-ink/20 px-3 py-2"
				/>
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				proudest metric
				<input name="k" value={val('k')} class="rounded-md border border-ink/20 px-3 py-2" />
			</label>
		</div>

		<div class="flex flex-col gap-4">
			<h2 class="text-sm font-semibold tracking-wide text-cobalt uppercase">for investors</h2>
			<p class="text-sm text-ink/60">
				one real number is worth more here than three paragraphs — you can add it later if you
				don't have it yet.
			</p>
			<p class="text-sm text-ink/60">
				whatever you put here is stamped with today's date and shown with it. it keeps full weight for
				three months, half for three more, then stops counting until you confirm it.
			</p>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				headline number
				<input name="hm" value={val('hm')} placeholder="2,400 · or: first 1,000 paying users" class="rounded-md border border-ink/20 px-3 py-2" />
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				what that number is
				<input name="hl" value={val('hl')} placeholder="paying customers" class="rounded-md border border-ink/20 px-3 py-2" />
				<span class="text-xs text-ink/50">
					milestones age better than totals. "first ₦1m month, august 2026" stays true; "₦1m a month"
					stops being true the month it changes.
				</span>
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				stage
				<select name="sg" value={val('sg')} class="rounded-md border border-ink/20 px-3 py-2">
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
					<input name="rt" value={val('rt')} placeholder="₦80m seed" class="rounded-md border border-ink/20 px-3 py-2" />
				</label>
			{/if}
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				photo of you (link)
				<input name="fp" type="url" value={val('fp')} placeholder="https://" class="rounded-md border border-ink/20 px-3 py-2" />
				<span class="text-xs text-ink/50">investors back people. a face doubles the odds anyone reads the rest.</span>
			</label>
		</div>

		<button
			type="submit"
			class="self-start rounded-full bg-cobalt px-6 py-3 text-sm font-medium text-white hover:bg-cobalt/90"
		>
			submit
		</button>
	</form>
</div>
