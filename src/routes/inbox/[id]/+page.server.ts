import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { get_conv, get_thread, mark_read } from '$lib/server/chat';
import { who_of, who_label } from '$lib/server/profile';
import { href } from '$lib/who';
import { in_conv, norm, peer_of } from '$lib/chat';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) throw redirect(302, '/google?next=/inbox');
	const me = norm(locals.user.e);
	const c = await get_conv(env, params.id);
	if (!c || !in_conv(c, me)) throw error(404, 'not found');
	const msgs = await get_thread(env, c.cv);
	await mark_read(env, c, me);
	const peer = peer_of(c, me);
	const names = await who_of(env, [peer]);
	return {
		me,
		id: params.id,
		who: who_label(names, peer),
		to: href(names[peer]),
		pg: c.pg,
		pn: c.pn,
		msgs
	};
};
