import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { retrieve_one, upsert, uuid_from } from '$lib/server/qdrant';

const slugify = (s: string) =>
	s
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/google');
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) throw error(401, 'auth');
		const fd = await request.formData();
		const v = (k: string) => ((fd.get(k) as string) ?? '').trim();

		const y = v('y');
		const e = v('e');
		const n = v('n');
		const u = v('u');
		const o = v('o');

		const errs: Record<string, string> = {};
		if (!y) errs.y = 'required';
		if (!e) errs.e = 'required';
		if (!n) errs.n = 'required';
		if (!u) errs.u = 'required';
		if (!o) errs.o = 'required';
		if (Object.keys(errs).length) return fail(400, errs);

		const g = slugify(n);
		const id = await uuid_from(g);
		const existing = await retrieve_one(env, id);
		const ep = (existing?.payload ?? {}) as Record<string, unknown>;

		const l = (() => {
			try {
				return new URL(u).hostname;
			} catch {
				return u;
			}
		})();

		const b = { n: y, e, p: v('p'), l: v('i'), c: v('v') };
		const metrics = { d: v('d'), q: v('q'), m: v('m'), a: v('a'), z: v('z'), k: v('k') };

		const payload = existing
			? { ...ep, u, l, b, ...metrics }
			: {
					s: 'adca',
					t: 'p',
					g,
					n,
					u,
					l,
					r: 'u',
					c: 'y',
					e: locals.user.e,
					o,
					w: o,
					h: '',
					x: '',
					b,
					...metrics,
					j: Math.floor(Date.now() / 1000)
				};

		await upsert(env, [{ id, payload }]);
		throw redirect(303, '/' + g);
	}
};
