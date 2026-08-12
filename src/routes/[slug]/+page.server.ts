import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { retrieve_one, uuid_from, scroll, eq, f } from '$lib/server/qdrant';
import { related } from '$lib/detail';
import type { P } from '$lib/investor';

export const load: PageServerLoad = async ({ params, locals }) => {
	const pt = await retrieve_one(env, await uuid_from(params.slug));
	if (!pt || !pt.payload) throw error(404, 'not found');
	const p = pt.payload as Record<string, unknown>;
	const own = !!locals.user && locals.user.e === p.e;
	const can_msg = !!p.e && !own;
	delete p.e;

	const all = (await scroll(env, f(eq('s', 'adca'), eq('t', 'p')), 500)).map((x) => {
		const o = { ...(x.payload as Record<string, string>) };
		delete o.e;
		return o;
	});
	const rel = related(all, p as P, 3).map((o) => ({ g: o.g, n: o.n, o: o.o, c: o.c }));

	if (!own) return { p, own, can_msg, rel, asks: [] };
	const pts = await scroll(env, f(eq('s', 'adca'), eq('t', 'x'), eq('pg', params.slug)), 200);
	const asks = pts
		.map((x) => x.payload as Record<string, string>)
		.sort((a, b) => Number(b.j ?? 0) - Number(a.j ?? 0));
	return { p, own, can_msg, rel, asks };
};
