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
	<header class="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur">
		<nav class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
			<a href="/" class="flex items-center gap-2 font-display text-xl font-semibold tracking-tight text-ink">
				<img src={favicon} alt="" class="h-7 w-7" />
				devcircles
			</a>
			<div class="flex items-center gap-4 text-sm">
				<a href="/raising" class="wipe text-cobalt">raising</a>
				<a href="/submit" class="wipe text-cobalt">submit</a>
				{#if data.u}
					<a href="/inbox" class="wipe inline-flex items-center gap-1 text-cobalt">
						inbox
						{#if data.un}
							<span class="rounded-full bg-cobalt px-1.5 py-0.5 text-[10px] font-medium text-white"
								>{data.un}</span
							>
						{/if}
					</a>
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
		<div class="mx-auto grid max-w-5xl gap-8 px-6 py-12 text-sm text-ink/60 md:grid-cols-2">
			<div>
				<span class="flex items-center gap-2 font-display text-base font-medium text-ink">
					<img src={favicon} alt="" class="h-5 w-5 opacity-60" />
					devcircles community
				</span>
				<p class="mt-3 max-w-sm">
					every product on this page was built by someone in a devcircles community, and the numbers
					beside it come from the person who built it.
				</p>
			</div>
			<div class="flex flex-col gap-4 md:items-end">
				<nav class="flex flex-wrap gap-6">
					<a href="/#about" class="wipe">about</a>
					<a href="/raising" class="wipe">raising</a>
					<a href="/submit" class="wipe">submit</a>
					<a href="https://www.linkedin.com/company/devcircles" target="_blank" rel="noopener noreferrer" class="wipe">linkedin</a>
					<a href="https://www.instagram.com/dev_circles/" target="_blank" rel="noopener noreferrer" class="wipe">instagram</a>
				</nav>
				<p class="text-ink/50">© {new Date().getFullYear()} devcircles community</p>
			</div>
		</div>
	</footer>
</div>
