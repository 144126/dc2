import type { Actions, PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { retrieve_one, upsert, remove, uuid_from } from '$lib/server/qdrant';
import { list_sectors } from '$lib/server/sectors';
import { country_label, slugify } from '$lib/places';

export const load: PageServerLoad = async ({ params, locals }) => {
	const pt = await retrieve_one(env, await uuid_from(params.slug));
	if (!pt || !pt.payload) throw error(404, 'not found');
	const p = pt.payload as Record<string, string>;
	if (!locals.user || locals.user.e !== p.e) throw error(403, 'not owner');
	return { p };
};

async function load_owned(params: { slug: string }, locals: App.Locals) {
	const id = await uuid_from(params.slug);
	const pt = await retrieve_one(env, id);
	if (!pt || !pt.payload) throw error(404, 'not found');
	const ep = pt.payload as Record<string, unknown>;
	if (!locals.user || locals.user.e !== ep.e) throw error(403, 'not owner');
	return { id, ep };
}

export const actions: Actions = {
	save: async ({ request, params, locals }) => {
		const { id, ep } = await load_owned(params, locals);
		const fd = await request.formData();
		const v = (k: string) => ((fd.get(k) as string) ?? '').trim();

		const b = {
			n: v('y'),
			e: fd.get('pe') ? v('e') : '',
			p: v('p'),
			l: v('i'),
			c: v('v'),
			r: v('br')
		};
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
		const sectors = await list_sectors(env);
		const chosen_sector = sectors.find((s) => s.g === v('c'));
		const c = chosen_sector?.g ?? (ep.c as string);
		const cn = chosen_sector?.n ?? (ep.cn as string);

		const u = v('u');
		const l = (() => {
			try {
				return new URL(u).hostname;
			} catch {
				return u;
			}
		})();

		const payload = {
			...ep,
			u,
			l,
			c,
			cn,
			ci: v('ci'),
			sc: v('sc'),
			ts: v('ts'),
			gh: v('gh'),
			dk: v('dk'),
			o: v('o'),
			w: v('w'),
			h: v('h'),
			x: v('x'),
			b,
			...metrics,
			...investor
		};

		await upsert(env, [{ id, payload }]);
		throw redirect(303, '/' + params.slug + '?saved=1');
	},

	confirm: async ({ params, locals }) => {
		const { id, ep } = await load_owned(params, locals);
		await upsert(env, [{ id, payload: { ...ep, hj: String(Math.floor(Date.now() / 1000)) } }]);
		throw redirect(303, '/' + params.slug + '?confirmed=1');
	},

	del: async ({ request, params, locals }) => {
		const { id } = await load_owned(params, locals);
		const fd = await request.formData();
		if (fd.get('confirm') !== 'on') throw error(400, 'confirm required');
		await remove(env, id);
		throw redirect(303, '/');
	}
};
