import { eq, rng, f, type Cond, type Filter } from './filter.ts';
import { slug_handle, handle_ok, next_handle } from './profile.ts';

export type Room = {
	hn: string;
	nm: string;
	ds: string;
	ow: string;
	mb: string[];
	tg: string[];
	mx: string;
	md: number;
	j: number;
};

export type Rmsg = { rh: string; mf: string; mx: string; md: number };

export const room_slug = slug_handle;
export const room_ok = handle_ok;
export const next_room = next_handle;

export const in_room = (r: Room, email: string): boolean =>
	r.mb.includes(email.toLowerCase().trim());

export const room_filter = (): Filter => f(eq('s', 'adca'), eq('t', 'rm'));

export const room_one_filter = (hn: string): Filter =>
	f(eq('s', 'adca'), eq('t', 'rm'), eq('hn', hn));

export const room_msg_filter = (hn: string, after?: number): Filter => {
	const conds: Cond[] = [eq('s', 'adca'), eq('t', 'rg'), eq('rh', hn)];
	if (after) conds.push(rng('md', after + 1));
	return f(...conds);
};

export const room_match = (q: string, r: Pick<Room, 'hn' | 'nm' | 'ds' | 'tg'>): boolean => {
	const words = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
	if (!words.length) return true;
	const hay = [r.hn, r.nm, r.ds, ...r.tg].join(' ').toLowerCase();
	return words.every((w) => hay.includes(w));
};

export const member_count = (r: Pick<Room, 'mb'>): number => r.mb.length;
