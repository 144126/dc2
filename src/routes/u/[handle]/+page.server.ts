import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { by_handle, products_of } from '$lib/server/profile';
import { rooms_of } from '$lib/server/room';

export const load: PageServerLoad = async ({ params, locals }) => {
	const hit = await by_handle(env, params.handle);
	if (!hit) throw error(404, 'not found');
	const [products, rooms] = await Promise.all([
		products_of(env, hit.email),
		rooms_of(env, hit.email)
	]);
	const own = !!locals.user && locals.user.e.toLowerCase() === hit.email;
	return { prof: hit.prof, products, rooms, own, can_msg: !own };
};
