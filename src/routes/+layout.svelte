<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex min-h-screen flex-col bg-white text-ink">
	<header class="border-b border-ink/10">
		<nav class="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
			<a href="/" class="font-display text-xl font-semibold tracking-tight text-ink">
				devcircles
			</a>
			<a href="/submit" class="text-sm text-cobalt hover:underline">submit</a>
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
