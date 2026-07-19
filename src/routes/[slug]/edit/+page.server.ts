import type { Actions, PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { retrieve_one, upsert, uuid_from } from '$lib/server/qdrant';

export const load: PageServerLoad = async ({ params, locals }) => {
	const pt = await retrieve_one(env, await uuid_from(params.slug));
	if (!pt || !pt.payload) throw error(404, 'not found');
	const p = pt.payload as Record<string, string>;
	if (!locals.user || locals.user.e !== p.e) throw error(403, 'not owner');
	return { p };
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const id = await uuid_from(params.slug);
		const pt = await retrieve_one(env, id);
		if (!pt || !pt.payload) throw error(404, 'not found');
		const ep = pt.payload as Record<string, unknown>;
		if (!locals.user || locals.user.e !== ep.e) throw error(403, 'not owner');

		const fd = await request.formData();
		const v = (k: string) => ((fd.get(k) as string) ?? '').trim();

		const b = { n: v('y'), e: v('e'), p: v('p'), l: v('i'), c: v('v') };
		const metrics = { d: v('d'), q: v('q'), m: v('m'), a: v('a'), z: v('z'), k: v('k') };

		const payload = {
			...ep,
			u: v('u'),
			o: v('o'),
			w: v('w'),
			h: v('h'),
			x: v('x'),
			b,
			...metrics
		};

		await upsert(env, [{ id, payload }]);
		throw redirect(303, '/' + params.slug);
	}
};
