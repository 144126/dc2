export function ctrl_enter(node: HTMLElement, submit: () => void) {
	const on_key = (ev: KeyboardEvent) => {
		if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') {
			ev.preventDefault();
			submit();
		}
	};
	node.addEventListener('keydown', on_key);
	return { destroy: () => node.removeEventListener('keydown', on_key) };
}
