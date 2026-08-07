export function reveal(node: HTMLElement, delay = 0) {
	if (!matchMedia('(prefers-reduced-motion: no-preference)').matches) {
		node.classList.add('shown');
		return;
	}
	node.classList.add('reveal');
	const io = new IntersectionObserver(
		([e]) => {
			if (!e.isIntersecting) return;
			setTimeout(() => node.classList.add('shown'), delay);
			io.disconnect();
		},
		{ rootMargin: '0px 0px -12% 0px' }
	);
	io.observe(node);
	return { destroy: () => io.disconnect() };
}
