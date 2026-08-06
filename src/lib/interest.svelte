<script lang="ts">
	import { ctrl_enter } from '$lib/ctrl_enter';

	let { pg, direct }: { pg: string; direct: string } = $props();

	let open = $state(false);
	let sent = $state(false);
	let busy = $state(false);
	let err = $state('');
	let nm = $state('');
	let em = $state('');
	let fm = $state('');
	let ms = $state('');
	let form: HTMLFormElement;

	async function send() {
		if (busy) return;
		busy = true;
		err = '';
		try {
			const r = await fetch('/api/interest', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ pg, nm, em, fm, ms })
			});
			if (!r.ok) throw new Error((await r.text()) || 'that did not send');
			sent = true;
		} catch (e) {
			err = e instanceof Error ? e.message : 'that did not send';
		} finally {
			busy = false;
		}
	}
</script>

<div class="mt-14 rounded-lg bg-cobalt/5 p-6">
	<h2 class="font-display text-lg font-medium text-ink">interested in this one?</h2>
	{#if sent}
		<p class="mt-2 text-ink/75">sent. the founder has your details.</p>
	{:else}
		<p class="mt-2 text-ink/70">
			devcircles will introduce you, or reach the founder yourself — whichever you prefer.
		</p>
		<div class="mt-4 flex flex-wrap items-center gap-4">
			<button
				type="button"
				onclick={() => (open = !open)}
				class="rounded-full bg-cobalt px-6 py-3 text-sm font-medium text-white hover:bg-cobalt/90"
			>
				request an introduction
			</button>
			{#if direct}
				<a href="mailto:{direct}" class="text-sm text-cobalt hover:underline">or email the founder directly</a>
			{/if}
		</div>
		{#if open}
			<form
				bind:this={form}
				use:ctrl_enter={() => form.requestSubmit()}
				onsubmit={(ev) => {
					ev.preventDefault();
					send();
				}}
				class="mt-6 flex flex-col gap-3"
			>
				<input bind:value={nm} required placeholder="your name" class="rounded-md border border-ink/20 px-3 py-2 text-sm" />
				<input bind:value={em} required type="email" placeholder="your email" class="rounded-md border border-ink/20 px-3 py-2 text-sm" />
				<input bind:value={fm} placeholder="firm (optional)" class="rounded-md border border-ink/20 px-3 py-2 text-sm" />
				<textarea bind:value={ms} rows="3" placeholder="anything you want to ask (optional)" class="rounded-md border border-ink/20 px-3 py-2 text-sm"></textarea>
				{#if err}<p class="text-xs text-coral">{err}</p>{/if}
				<button
					type="submit"
					disabled={busy}
					class="self-start rounded-full bg-cobalt px-6 py-3 text-sm font-medium text-white hover:bg-cobalt/90 disabled:opacity-50"
				>
					{busy ? 'sending…' : 'send'}
				</button>
				<p class="text-xs text-ink/50">ctrl+enter sends</p>
			</form>
		{/if}
	{/if}
</div>
