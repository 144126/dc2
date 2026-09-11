import { is_fresh, type P } from './investor.ts';

export type Prof = {
	hn: string;
	nm: string;
	bo: string;
	pf: string;
	cb: string;
	lc: string;
	lk: string;
	li: string;
	tg: string[];
	j: number;
};

export const slug_handle = (s: string): string =>
	s
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 24)
		.replace(/-+$/, '');

export const handle_ok = (h: string): boolean => /^[a-z0-9][a-z0-9-]{1,23}$/.test(h);

export const default_handle = (email: string): string =>
	slug_handle(email.split('@')[0].replace(/\+.*$/, '')) || 'builder';

export const next_handle = (want: string, taken: string[]): string => {
	const set = new Set(taken);
	if (!set.has(want)) return want;
	for (let i = 2; i < 1000; i++) {
		const stem = want.slice(0, 24 - String(i).length - 1).replace(/-+$/, '');
		if (!set.has(`${stem}-${i}`)) return `${stem}-${i}`;
	}
	return want;
};

export const profile_stats = (products: P[], now = Date.now()) => ({
	n: products.length,
	live: products.filter((p) => p.r === 'l').length,
	raising: products.filter((p) => p.ra === 'y' && is_fresh(p, now)).length
});

export const joined = (products: P[]): number =>
	products.reduce((min, p) => {
		const j = Number(p.j);
		return Number.isFinite(j) && j > 0 && (min === 0 || j < min) ? j : min;
	}, 0);
