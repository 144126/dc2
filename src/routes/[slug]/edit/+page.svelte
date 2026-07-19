<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	const p = $derived(data.p as Record<string, string> & { b?: Record<string, string> });
	const b = $derived(p.b ?? {});
</script>

<div class="mx-auto max-w-2xl px-6 py-16">
	<h1 class="font-display text-3xl font-semibold tracking-tight text-ink">edit {p.n}</h1>
	<p class="mt-3 text-ink/60">the product name is fixed since the page url is derived from it.</p>

	<form method="POST" class="mt-10 flex flex-col gap-8">
		<div class="flex flex-col gap-4">
			<h2 class="text-sm font-semibold tracking-wide text-cobalt uppercase">about the product</h2>
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
				what it does
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
				email
				<input name="e" type="email" value={b.e} class="rounded-md border border-ink/20 px-3 py-2" />
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				phone
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
				<input name="d" value={p.d} class="rounded-md border border-ink/20 px-3 py-2" />
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				users / signups / downloads
				<input name="q" value={p.q} class="rounded-md border border-ink/20 px-3 py-2" />
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				revenue?
				<select name="m" value={p.m} class="rounded-md border border-ink/20 px-3 py-2">
					<option value="">prefer not to say</option>
					<option value="y">yes</option>
					<option value="n">no</option>
				</select>
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				revenue amount
				<input name="a" value={p.a} class="rounded-md border border-ink/20 px-3 py-2" />
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				team size
				<input name="z" value={p.z} class="rounded-md border border-ink/20 px-3 py-2" />
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				proudest metric
				<input name="k" value={p.k} class="rounded-md border border-ink/20 px-3 py-2" />
			</label>
		</div>

		<button
			type="submit"
			class="self-start rounded-full bg-cobalt px-6 py-3 text-sm font-medium text-white hover:bg-cobalt/90"
		>
			save changes
		</button>
	</form>
</div>
