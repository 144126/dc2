import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { retrieve_one, uuid_from, scroll, eq, f } from '$lib/server/qdrant';

export const load: PageServerLoad = async ({ params, locals }) => {
	const pt = await retrieve_one(env, await uuid_from(params.slug));
	if (!pt || !pt.payload) throw error(404, 'not found');
	const p = pt.payload as Record<string, unknown>;
	const owner = !!locals.user && locals.user.e === p.e;
	delete p.e;
	if (!owner) return { p, asks: [] };
	const pts = await scroll(env, f(eq('s', 'adca'), eq('t', 'x'), eq('pg', params.slug)), 200);
	const asks = pts
		.map((x) => x.payload as Record<string, string>)
		.sort((a, b) => Number(b.j ?? 0) - Number(a.j ?? 0));
	return { p, asks };
};
