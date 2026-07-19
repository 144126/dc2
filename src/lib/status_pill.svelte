<script lang="ts">
	import { status_label } from '$lib/sectors';
	let { r }: { r: string } = $props();
	const cls: Record<string, string> = {
		l: 'bg-teal-brand text-white',
		p: 'bg-ochre text-ink',
		u: 'bg-ink/10 text-ink/60'
	};
</script>

<span
	class="inline-flex items-center leading-none rounded-full px-2.5 py-1 text-[10px] font-medium tracking-wide uppercase {cls[
		r
	] ?? cls.u}"
>
	{status_label[r] ?? 'unverified'}
</span>
