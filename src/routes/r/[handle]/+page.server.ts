import type { Actions, PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { get_room, get_room_thread, join_room, leave_room, edit_room, drop_room } from '$lib/server/room';
import { who_of } from '$lib/server/profile';
import { norm } from '$lib/chat';

export const load: PageServerLoad = async ({ params, locals }) => {
	const r = await get_room(env, params.handle);
	if (!r) throw error(404, 'not found');
	const me = locals.user ? norm(locals.user.e) : '';
	const msgs = await get_room_thread(env, r.hn);
	const names = await who_of(env, [...r.mb, ...msgs.map((m) => m.mf)]);
	return { r, me, msgs, names, signed_in: !!locals.user };
};

export const actions: Actions = {
	join: async ({ params, locals }) => {
		if (!locals.user) throw redirect(302, '/google?next=/r/' + params.handle);
		const r = await join_room(env, params.handle, locals.user.e);
		if (!r) throw error(404, 'not found');
		throw redirect(303, '/r/' + r.hn);
	},
	leave: async ({ params, locals }) => {
		if (!locals.user) throw redirect(302, '/google?next=/r/' + params.handle);
		const r = await leave_room(env, params.handle, locals.user.e);
		if (!r) throw error(404, 'not found');
		throw redirect(303, '/r/' + r.hn);
	},
	edit: async ({ request, params, locals }) => {
		if (!locals.user) throw redirect(302, '/google?next=/r/' + params.handle);
		const fd = await request.formData();
		const v = (k: string) => ((fd.get(k) as string) ?? '').trim();
		const out = await edit_room(env, params.handle, locals.user.e, {
			name: v('nm'),
			about: v('ds'),
			tags: v('tg')
		});
		if (!out.ok) throw error(403, out.why);
		throw redirect(303, '/r/' + out.hn);
	},
	drop: async ({ params, locals }) => {
		if (!locals.user) throw redirect(302, '/google?next=/r/' + params.handle);
		const out = await drop_room(env, params.handle, locals.user.e);
		if (!out.ok) throw error(403, out.why);
		throw redirect(303, '/r');
	}
};
