export const tag_list = (s: string): string[] =>
	s
		.toLowerCase()
		.split(/[,\n]+/)
		.map((t) => t.trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
		.filter((t) => t.length >= 2 && t.length <= 24)
		.filter((t, i, a) => a.indexOf(t) === i)
		.slice(0, 12);

export type PeopleHit = {
	hn: string;
	nm: string;
	bo: string;
	lc: string;
	tg: string[];
	extra?: string[];
};

export const people_hay = (p: PeopleHit): string =>
	[p.hn, p.nm, p.bo, p.lc, ...p.tg, ...(p.extra ?? [])].join(' ').toLowerCase();

export const people_match = (q: string, p: PeopleHit): boolean => {
	const words = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
	if (!words.length) return true;
	const hay = people_hay(p);
	return words.every((w) => hay.includes(w));
};

export const people_visible = (p: {
	nm: string;
	bo: string;
	tg: string[];
	n: number;
}): boolean => !!(p.nm || p.bo || p.tg.length || p.n);

export const overlap = (a: string[], b: string[]): string[] => {
	const set = new Set(a.map((x) => x.toLowerCase()).filter(Boolean));
	return b.filter((x) => set.has(x.toLowerCase()));
};

export const same_place = (a: string, b: string): boolean => {
	const x = a.toLowerCase().trim();
	const y = b.toLowerCase().trim();
	return !!x && x === y;
};

export const like_score = (
	me: { lc: string; tg: string[]; cs: string[] },
	them: { lc: string; tg: string[]; cs: string[] }
): number =>
	(same_place(me.lc, them.lc) ? 3 : 0) +
	overlap(me.tg, them.tg).length * 2 +
	overlap(me.cs, them.cs).length;
