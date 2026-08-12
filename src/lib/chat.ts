import { eq, txt, rng, f, f_or, type Cond, type Filter } from './filter.ts';

export type Msg = { cv: string; mf: string; mt: string; mx: string; md: number; pg: string };
export type Conv = {
	cv: string;
	ma: string;
	mb: string;
	pg: string;
	pn: string;
	mx: string;
	md: number;
	ua: number;
	ub: number;
};

export const norm = (e: string): string => e.toLowerCase().trim();

export const conv_id = (a: string, b: string): string => [norm(a), norm(b)].sort().join('|');

export const preview = (text: string): string => {
	const s = text.replace(/\s+/g, ' ').trim();
	return s.length > 160 ? s.slice(0, 159) + '…' : s;
};

export const is_a = (c: Conv, me: string): boolean => c.ma === norm(me);
export const peer_of = (c: Conv, me: string): string => (is_a(c, me) ? c.mb : c.ma);
export const unread_key = (c: Conv, me: string): 'ua' | 'ub' => (is_a(c, me) ? 'ua' : 'ub');
export const unread_of = (c: Conv, me: string): number => Number(c[unread_key(c, me)] ?? 0);
export const in_conv = (c: Conv, me: string): boolean => c.ma === norm(me) || c.mb === norm(me);

export const conv_filter = (me: string): Filter =>
	f_or([eq('s', 'adca'), eq('t', 'cv')], [eq('ma', norm(me)), eq('mb', norm(me))]);

export const search_filter = (me: string, q: string): Filter =>
	f_or(
		[eq('s', 'adca'), eq('t', 'm'), txt('mx', q.trim())],
		[eq('mf', norm(me)), eq('mt', norm(me))]
	);

export const thread_filter = (cv: string, after?: number): Filter => {
	const conds: Cond[] = [eq('s', 'adca'), eq('t', 'm'), eq('cv', cv)];
	if (after) conds.push(rng('md', after + 1));
	return f(...conds);
};
