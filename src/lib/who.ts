export type Who = { e: string; hn: string; nm: string };

export const label = (w: Who | null | undefined, email: string): string => {
	if (w?.nm) return w.nm;
	if (w?.hn) return w.hn;
	const local = email.split('@')[0] ?? '';
	return local || email;
};

export const href = (w: Who | null | undefined): string => (w?.hn ? '/u/' + w.hn : '');

export const at = (w: Who | null | undefined): string => (w?.hn ? '@' + w.hn : '');
