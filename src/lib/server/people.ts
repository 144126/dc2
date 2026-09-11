import { scroll, ensure, eq, f, type QEnv } from './qdrant';
import { people_match, people_visible, like_score } from '$lib/people';
import { default_handle, profile_stats, type Prof } from '$lib/profile';
import { sector_info } from '$lib/sectors';
import type { P } from '$lib/investor';

export type Person = {
	hn: string;
	to: string;
	nm: string;
	bo: string;
	pf: string;
	lc: string;
	tg: string[];
	n: number;
	cs: string[];
	like: number;
	has: boolean;
};

const to_prof = (p: Record<string, unknown>): Prof => ({
	hn: String(p.hn ?? ''),
	nm: String(p.nm ?? ''),
	bo: String(p.bo ?? ''),
	pf: String(p.pf ?? ''),
	cb: String(p.cb ?? ''),
	lc: String(p.lc ?? ''),
	lk: String(p.lk ?? ''),
	li: String(p.li ?? ''),
	tg: Array.isArray(p.tg) ? p.tg.map((x) => String(x)) : [],
	j: Number(p.j ?? 0)
});

const sectors_of = (products: P[]): string[] => [...new Set(products.map((p) => p.c).filter(Boolean))];

const extra_of = (products: P[]): string[] =>
	products.flatMap((p) => [p.n, p.o, sector_info[p.c]?.n ?? '']).filter(Boolean);

export async function list_people(
	env: QEnv,
	q: string,
	me?: string,
	sector?: string
): Promise<Person[]> {
	await ensure(env);
	const [pts, prod_pts] = await Promise.all([
		scroll(env, f(eq('s', 'adca'), eq('t', 'bu')), 500),
		scroll(env, f(eq('s', 'adca'), eq('t', 'p')), 1000)
	]);
	const by_email = new Map<string, P[]>();
	for (const pt of prod_pts) {
		const raw = pt.payload as Record<string, string> | null;
		if (!raw) continue;
		const email = String(raw.e ?? '').toLowerCase();
		if (!email) continue;
		const o = { ...raw };
		delete o.e;
		const list = by_email.get(email) ?? [];
		list.push(o);
		by_email.set(email, list);
	}
	const mine = me?.toLowerCase().trim() ?? '';
	const seen = new Set<string>();
	const rows: Person[] = [];

	const push = (email: string, prof: Prof | null, products: P[]) => {
		if (!email || email === mine || seen.has(email)) return;
		const stats = profile_stats(products);
		const hn = prof?.hn || default_handle(email);
		const nm = prof?.nm ?? '';
		const person = {
			hn,
			to: prof?.hn ? '/u/' + prof.hn : products[0]?.g ? '/' + products[0].g : '',
			nm: nm || products[0]?.n || hn,
			bo: prof?.bo ?? '',
			pf: prof?.pf ?? '',
			lc: prof?.lc ?? '',
			tg: prof?.tg ?? [],
			n: stats.n,
			cs: sectors_of(products),
			like: 0,
			has: !!prof?.hn
		};
		if (!person.to || !people_visible({ nm, bo: person.bo, tg: person.tg, n: person.n })) return;
		if (
			!people_match(q, {
				hn: person.hn,
				nm: person.nm,
				bo: person.bo,
				lc: person.lc,
				tg: person.tg,
				extra: extra_of(products)
			})
		)
			return;
		seen.add(email);
		rows.push(person);
	};

	const profs = new Map<string, Prof>();
	for (const pt of pts) {
		const p = pt.payload as Record<string, unknown> | null;
		if (!p) continue;
		const email = String(p.e ?? '').toLowerCase();
		if (!email) continue;
		const prof = to_prof(p);
		profs.set(email, prof);
		push(email, prof, by_email.get(email) ?? []);
	}
	for (const [email, products] of by_email) push(email, profs.get(email) ?? null, products);

	if (mine) {
		const mine_p = profs.get(mine);
		const mine_cs = sectors_of(by_email.get(mine) ?? []);
		if (mine_p || mine_cs.length)
			for (const row of rows)
				row.like = like_score(
					{ lc: mine_p?.lc ?? '', tg: mine_p?.tg ?? [], cs: mine_cs },
					{ lc: row.lc, tg: row.tg, cs: row.cs }
				);
	}
	const out = sector ? rows.filter((p) => p.cs.includes(sector)) : rows;
	return out.sort((a, b) => b.like - a.like || b.n - a.n || a.nm.localeCompare(b.nm));
}
