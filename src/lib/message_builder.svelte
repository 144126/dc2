<script lang="ts">
	import { goto } from '$app/navigation';
	import { ctrl_enter } from '$lib/ctrl_enter';
	import Icon from '$lib/icon.svelte';

	let { pg, who, signed_in }: { pg: string; who: string; signed_in: boolean } = $props();

	let text = $state('');
	let busy = $state(false);
	let err = $state('');
	let form: HTMLFormElement;

	async function send() {
		if (busy || !text.trim()) return;
		busy = true;
		err = '';
		try {
			const r = await fetch('/api/msg', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ pg, x: text })
			});
			if (!r.ok) throw new Error((await r.text()) || 'that did not send');
			const { id } = (await r.json()) as { id: string };
			await goto('/inbox/' + id);
		} catch (e) {
			err = e instanceof Error ? e.message : 'that did not send';
			busy = false;
		}
	}
</script>

<div class="mt-14 rounded-lg border border-ink/10 p-6">
	<h2 class="flex items-center gap-2 font-display text-lg font-medium text-ink">
		<Icon n="chat" c="h-5 w-5 text-cobalt" />
		message {who || 'the builder'}
	</h2>
	{#if signed_in}
		<p class="mt-2 text-ink/70">
			goes straight to their inbox on devcircles. you keep the whole thread, and you can search it
			later.
		</p>
		<form
			bind:this={form}
			use:ctrl_enter={() => form.requestSubmit()}
			onsubmit={(ev) => {
				ev.preventDefault();
				send();
			}}
			class="mt-4 flex flex-col gap-3"
		>
			<textarea
				bind:value={text}
				rows="3"
				placeholder="what do you want to ask?"
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
					{busy ? 'sending…' : 'send message'}
				</button>
				<span class="text-xs text-ink/50">ctrl+enter sends</span>
			</div>
		</form>
	{:else}
		<p class="mt-2 text-ink/70">sign in and your message goes straight to their devcircles inbox.</p>
		<a
			href="/google?next=/{pg}"
			data-sveltekit-reload
			class="mt-4 inline-block rounded-full bg-cobalt px-6 py-3 text-sm font-medium text-white hover:bg-cobalt/90"
		>
			sign in to message
		</a>
	{/if}
</div>
