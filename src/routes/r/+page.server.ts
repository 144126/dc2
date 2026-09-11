import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { list_rooms, save_room } from '$lib/server/room';
import { room_match } from '$lib/room';
import { norm } from '$lib/chat';

export const load: PageServerLoad = async ({ locals, url }) => {
	const q = (url.searchParams.get('q') ?? '').trim();
	const rooms = (await list_rooms(env)).filter((r) => room_match(q, r));
	const me = locals.user ? norm(locals.user.e) : '';
	return { q, rooms, me, signed_in: !!locals.user };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) throw redirect(302, '/google?next=/r');
		const fd = await request.formData();
		const v = (k: string) => ((fd.get(k) as string) ?? '').trim();
		const r = await save_room(env, locals.user.e, {
			name: v('nm'),
			about: v('ds'),
			tags: v('tg')
		});
		if (!r.ok) return fail(400, { why: r.why, nm: v('nm'), ds: v('ds'), tg: v('tg') });
		throw redirect(303, '/r/' + r.hn);
	}
};
