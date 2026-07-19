<script lang="ts">
	import type { ActionData } from './$types';
	let { form }: { form: ActionData } = $props();
	const err = (k: string) => (form as Record<string, string> | null)?.[k];
</script>

<div class="mx-auto max-w-2xl px-6 py-16">
	<h1 class="font-display text-3xl font-semibold tracking-tight text-ink">
		built something? add it to the report
	</h1>
	<p class="mt-3 text-ink/60">
		fields marked * are required. everything else can come later.
	</p>

	<form method="POST" class="mt-10 flex flex-col gap-8">
		<div class="flex flex-col gap-4">
			<h2 class="text-sm font-semibold tracking-wide text-cobalt uppercase">about you</h2>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				name*
				<input name="y" class="rounded-md border border-ink/20 px-3 py-2" />
				{#if err('y')}<span class="text-xs text-coral">{err('y')}</span>{/if}
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				email*
				<input name="e" type="email" class="rounded-md border border-ink/20 px-3 py-2" />
				{#if err('e')}<span class="text-xs text-coral">{err('e')}</span>{/if}
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				phone
				<input name="p" class="rounded-md border border-ink/20 px-3 py-2" />
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				linkedin
				<input name="i" class="rounded-md border border-ink/20 px-3 py-2" />
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				location
				<input name="v" class="rounded-md border border-ink/20 px-3 py-2" />
			</label>
		</div>

		<div class="flex flex-col gap-4">
			<h2 class="text-sm font-semibold tracking-wide text-cobalt uppercase">about the product</h2>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				product name*
				<input name="n" class="rounded-md border border-ink/20 px-3 py-2" />
				{#if err('n')}<span class="text-xs text-coral">{err('n')}</span>{/if}
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				product link*
				<input name="u" type="url" placeholder="https://" class="rounded-md border border-ink/20 px-3 py-2" />
				{#if err('u')}<span class="text-xs text-coral">{err('u')}</span>{/if}
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				short description*
				<textarea name="o" rows="3" class="rounded-md border border-ink/20 px-3 py-2"></textarea>
				{#if err('o')}<span class="text-xs text-coral">{err('o')}</span>{/if}
			</label>
		</div>

		<div class="flex flex-col gap-4">
			<h2 class="text-sm font-semibold tracking-wide text-cobalt uppercase">metrics (optional)</h2>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				launch date
				<input name="d" class="rounded-md border border-ink/20 px-3 py-2" />
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				users / signups / downloads
				<input name="q" class="rounded-md border border-ink/20 px-3 py-2" />
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				revenue?
				<select name="m" class="rounded-md border border-ink/20 px-3 py-2">
					<option value="">prefer not to say</option>
					<option value="y">yes</option>
					<option value="n">no</option>
				</select>
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				revenue amount
				<input name="a" class="rounded-md border border-ink/20 px-3 py-2" />
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				team size
				<input name="z" class="rounded-md border border-ink/20 px-3 py-2" />
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				proudest metric
				<input name="k" class="rounded-md border border-ink/20 px-3 py-2" />
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
