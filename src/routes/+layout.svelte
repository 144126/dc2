<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	let { children, data } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex min-h-screen flex-col bg-white text-ink">
	<header class="border-b border-ink/10">
		<nav class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
			<a href="/" class="font-display text-xl font-semibold tracking-tight text-ink">
				devcircles
			</a>
			<div class="flex items-center gap-4 text-sm">
				<a href="/submit" class="text-cobalt hover:underline">submit</a>
				{#if data.u}
					<span class="text-ink/50">{data.u.e}</span>
					<form method="POST" action="/logout">
						<button type="submit" class="text-cobalt hover:underline">sign out</button>
					</form>
				{:else}
					<a href="/google" data-sveltekit-reload class="text-cobalt hover:underline">sign in</a>
				{/if}
			</div>
		</nav>
	</header>

	<main class="flex-1">
		{@render children()}
	</main>

	<footer class="border-t border-ink/10">
		<div class="mx-auto max-w-5xl px-6 py-8 text-sm text-ink/50">
			devcircles community · abuja · july 2026
		</div>
	</footer>
</div>
