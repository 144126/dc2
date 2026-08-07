import type { Actions, PageServerLoad } from './$types';
import { error, fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { retrieve_one, upsert, uuid_from } from '$lib/server/qdrant';
import { list_sectors, slugify } from '$lib/server/sectors';
import { country_label } from '$lib/places';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/google?next=/submit');
	return { u: locals.user };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) throw error(401, 'auth');
		const fd = await request.formData();
		const v = (k: string) => ((fd.get(k) as string) ?? '').trim();
		const values = Object.fromEntries(fd) as Record<string, string>;

		const n = v('n');
		const u = v('u');
		const o = v('o');

		const errs: Record<string, string> = {};
		if (!n) errs.n = 'required';
		if (!u) errs.u = 'required';
		if (!o) errs.o = 'required';
		if (Object.keys(errs).length) return fail(400, { errs, values });

		const g = slugify(n);
		const id = await uuid_from(g);
		const existing = await retrieve_one(env, id);
		const ep = (existing?.payload ?? {}) as Record<string, unknown>;
		if (existing && ep.e !== locals.user.e)
			return fail(409, { errs: { n: 'name already taken' }, values });

		const l = (() => {
			try {
				return new URL(u).hostname;
			} catch {
				return u;
			}
		})();

		const sectors = await list_sectors(env);
		const chosen = sectors.find((s) => s.g === v('c'));
		const c = chosen?.g ?? 'y';
		const cn = chosen?.n ?? sectors.find((s) => s.g === 'y')?.n ?? 'early & in preview';
		const b = { n: v('y'), e: fd.get('pe') ? locals.user.e : '', p: '', l: '', c: v('v') };
		const metrics = { d: v('d'), q: v('q'), m: v('m'), a: v('a'), z: v('z'), k: v('k') };
		const investor = {
			hm: v('hm'),
			hl: v('hl'),
			sg: v('sg'),
			ra: v('ra'),
			rt: v('ra') === 'y' ? v('rt') : '',
			fp: v('fp'),
			hj: String(Math.floor(Date.now() / 1000)),
			co: country_label[v('co')] ? v('co') : '',
			st: slugify(v('st'))
		};

		const payload = existing
			? { ...ep, u, l, c, cn, b, ...metrics, ...investor }
			: {
					s: 'adca',
					t: 'p',
					g,
					n,
					u,
					l,
					r: 'u',
					c,
					cn,
					e: locals.user.e,
					o,
					w: v('w'),
					h: v('h'),
					x: v('x'),
					b,
					...metrics,
					...investor,
					j: Math.floor(Date.now() / 1000)
				};

		await upsert(env, [{ id, payload }]);
		throw redirect(303, '/' + g + '?submitted=1');
	}
};
