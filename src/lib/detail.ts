import { by_momentum, type P } from './investor.ts';
import { fmt_date, fmt_num } from './fmt.ts';

export const split_list = (v: string | undefined): string[] =>
	(v ?? '')
		.split(/[\n,]/)
		.map((s) => s.trim())
		.filter(Boolean);

export type ActionLink = { href: string; label: string; icon: string; primary: boolean };

export const action_links = (p: P): ActionLink[] => {
	const out: ActionLink[] = [];
	if (p.u) out.push({ href: p.u, label: 'visit the product', icon: 'open_in_new', primary: true });
	if (p.gh) out.push({ href: p.gh, label: 'source code', icon: 'code', primary: false });
	if (p.dk) out.push({ href: p.dk, label: 'documentation', icon: 'book', primary: false });
	return out;
};

export type NumberCard = { icon: string; v: string; l: string };

export const number_cards = (p: P): NumberCard[] =>
	[
		{ icon: 'rocket', v: fmt_date(p.d), l: 'launched' },
		{ icon: 'group', v: fmt_num(p.q), l: 'users, signups or downloads' },
		{
			icon: 'wallet',
			v: p.m === 'y' ? (p.a ? `₦${fmt_num(p.a)} / month` : 'yes') : p.m === 'n' ? 'no' : '',
			l: 'revenue'
		},
		{ icon: 'team', v: p.z ?? '', l: 'team size' },
		{ icon: 'star', v: p.k ?? '', l: 'proudest metric' }
	].filter((c) => c.v);

export const related = (all: P[], p: P, n = 3, now = Date.now()): P[] => {
	const others = all.filter((o) => o.g !== p.g).sort((a, b) => by_momentum(a, b, now));
	return [...others.filter((o) => o.c === p.c), ...others.filter((o) => o.c !== p.c)].slice(0, n);
};
