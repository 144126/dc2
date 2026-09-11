import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { ensure_profile, save_profile } from '$lib/server/profile';
import { tag_list } from '$lib/people';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(302, '/google?next=/profile');
	return { prof: await ensure_profile(env, locals.user.e) };
};

export const actions: Actions = {
	save: async ({ request, locals }) => {
		if (!locals.user) throw redirect(302, '/google?next=/profile');
		const fd = await request.formData();
		const v = (k: string) => ((fd.get(k) as string) ?? '').trim();
		const r = await save_profile(env, locals.user.e, {
			hn: v('hn'),
			nm: v('nm').slice(0, 80),
			bo: v('bo').slice(0, 400),
			pf: v('pf'),
			cb: v('cb'),
			lc: v('lc').slice(0, 80),
			lk: v('lk'),
			li: v('li'),
			tg: tag_list(v('tg'))
		});
		if (!r.ok) return fail(400, { why: r.why, hn: v('hn') });
		throw redirect(303, '/u/' + r.hn);
	}
};
