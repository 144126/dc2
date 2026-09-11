<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { enhance } from '$app/forms';
	import { ctrl_enter } from '$lib/ctrl_enter';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const p = $derived(data.prof);
	let save_form: HTMLFormElement;
</script>

<svelte:head>
	<title>your profile — devcircles</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto max-w-2xl px-6 py-16">
	<h1 class="font-display text-3xl font-semibold tracking-tight text-ink">your profile</h1>
	<p class="mt-3 text-ink/60">
		this is the page an investor lands on after reading one of your products. it is public at
		<a href="/u/{p.hn}" class="text-cobalt hover:underline">/u/{p.hn}</a>.
	</p>

	<form
		method="POST"
		action="?/save"
		use:enhance
		use:ctrl_enter={() => save_form.requestSubmit()}
		bind:this={save_form}
		class="mt-10 flex flex-col gap-8"
	>
		<div class="flex flex-col gap-4">
			<h2 class="font-mono text-xs tracking-[0.16em] text-cobalt uppercase">who you are</h2>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				handle
				<input
					name="hn"
					value={form?.hn ?? p.hn}
					class="rounded-md border border-ink/20 px-3 py-2"
				/>
				<span class="text-xs text-ink/50">
					2 to 24 letters, numbers or hyphens. your page lives at /u/&lt;handle&gt;.
				</span>
			</label>
			{#if form?.why}<p class="text-xs text-coral">{form.why}</p>{/if}
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				name
				<input name="nm" value={p.nm} class="rounded-md border border-ink/20 px-3 py-2" />
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				bio
				<textarea name="bo" rows="3" class="rounded-md border border-ink/20 px-3 py-2">{p.bo}</textarea
				>
				<span class="text-xs text-ink/50">
					what you build and who for. two sentences beat a paragraph.
				</span>
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				where you build from
				<input
					name="lc"
					value={p.lc}
					placeholder="abuja, nigeria"
					class="rounded-md border border-ink/20 px-3 py-2"
				/>
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				tags
				<input
					name="tg"
					value={p.tg.join(', ')}
					placeholder="fintech, rust, raising"
					class="rounded-md border border-ink/20 px-3 py-2"
				/>
				<span class="text-xs text-ink/50">
					comma separated. this is how people find you on /people.
				</span>
			</label>
		</div>

		<div class="flex flex-col gap-4">
			<h2 class="font-mono text-xs tracking-[0.16em] text-cobalt uppercase">pictures and links</h2>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				photo of you (link)
				<input
					name="pf"
					type="url"
					value={p.pf}
					placeholder="https://"
					class="rounded-md border border-ink/20 px-3 py-2"
				/>
				<span class="text-xs text-ink/50">investors back people. a face doubles the odds anyone reads the rest.</span>
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				cover image (link)
				<input
					name="cb"
					type="url"
					value={p.cb}
					placeholder="https://"
					class="rounded-md border border-ink/20 px-3 py-2"
				/>
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				your site
				<input
					name="lk"
					type="url"
					value={p.lk}
					placeholder="https://"
					class="rounded-md border border-ink/20 px-3 py-2"
				/>
			</label>
			<label class="flex flex-col gap-1 text-sm text-ink/70">
				linkedin
				<input
					name="li"
					type="url"
					value={p.li}
					placeholder="https://linkedin.com/in/…"
					class="rounded-md border border-ink/20 px-3 py-2"
				/>
			</label>
		</div>

		<div class="flex items-center gap-4">
			<button
				type="submit"
				class="rounded-full bg-cobalt px-6 py-3 text-sm font-medium text-white hover:bg-cobalt/90"
			>
				save profile
			</button>
			<a href="/u/{p.hn}" class="text-sm text-ink/60 hover:underline">view it</a>
			<span class="text-xs text-ink/50">ctrl+enter saves</span>
		</div>
	</form>
</div>
