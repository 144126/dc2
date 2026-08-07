<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.png';
	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="apple-touch-icon" href={favicon} />
	<meta property="og:site_name" content="devcircles" />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="https://devcircles.apexlinks.org/og.png" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<div class="grain flex min-h-screen flex-col bg-paper text-ink">
	<header class="border-b border-ink/10">
		<nav class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
			<a href="/" class="flex items-center gap-2 font-display text-xl font-semibold tracking-tight text-ink">
				<img src={favicon} alt="" class="h-7 w-7" />
				devcircles
			</a>
			<div class="flex items-center gap-4 text-sm">
				<a href="/raising" class="wipe text-cobalt">raising</a>
				<a href="/submit" class="wipe text-cobalt">submit</a>
				{#if data.u}
					<span class="max-sm:hidden text-ink/60">{data.u.e}</span>
					<form method="POST" action="/logout">
						<button type="submit" class="wipe text-cobalt">sign out</button>
					</form>
				{:else}
					<a href="/google" data-sveltekit-reload class="wipe text-cobalt">sign in with google</a>
				{/if}
			</div>
		</nav>
	</header>

	<main class="flex-1">
		{@render children()}
	</main>

	<footer class="border-t border-ink/10">
		<div class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-6 py-8 text-sm text-ink/60">
			<span class="flex items-center gap-2">
				<img src={favicon} alt="" class="h-5 w-5 opacity-60" />
				devcircles community · {new Date().getFullYear()}
			</span>
			<a href="/#about" class="wipe">about</a>
			<a href="/submit" class="wipe">submit</a>
			<a href="https://www.linkedin.com/company/devcircles" target="_blank" rel="noopener noreferrer" class="wipe">linkedin</a>
			<a href="https://www.instagram.com/dev_circles/" target="_blank" rel="noopener noreferrer" class="wipe">instagram</a>
		</div>
	</footer>
</div>
