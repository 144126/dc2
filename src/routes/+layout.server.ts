import type { LayoutServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { unread_total } from '$lib/server/chat';
import { norm } from '$lib/chat';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) return { u: null, un: 0 };
	return { u: locals.user, un: await unread_total(env, norm(locals.user.e)) };
};
