<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.png';
	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="apple-touch-icon" href={favicon} />
	<meta property="og:image" content={'https://devcircles.apexlinks.org' + favicon} />
	<meta name="twitter:card" content="summary" />
</svelte:head>

<div class="flex min-h-screen flex-col bg-white text-ink">
	<header class="border-b border-ink/10">
		<nav class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
			<a href="/" class="flex items-center gap-2 font-display text-xl font-semibold tracking-tight text-ink">
				<img src={favicon} alt="" class="h-7 w-7" />
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
		<div class="mx-auto flex max-w-5xl items-center gap-2 px-6 py-8 text-sm text-ink/50">
			<img src={favicon} alt="" class="h-5 w-5 opacity-60" />
			devcircles community · abuja · july 2026
		</div>
	</footer>
</div>
