import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { get_conv, get_thread, mark_read } from '$lib/server/chat';
import { in_conv, norm, peer_of } from '$lib/chat';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) throw redirect(302, '/google?next=/inbox');
	const me = norm(locals.user.e);
	const c = await get_conv(env, params.id);
	if (!c || !in_conv(c, me)) throw error(404, 'not found');
	const msgs = await get_thread(env, c.cv);
	await mark_read(env, c, me);
	return { me, id: params.id, who: peer_of(c, me), pg: c.pg, pn: c.pn, msgs };
};
