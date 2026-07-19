import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { retrieve_one, uuid_from } from '$lib/server/qdrant';

export const load: PageServerLoad = async ({ params }) => {
	const pt = await retrieve_one(env, await uuid_from(params.slug));
	if (!pt || !pt.payload) throw error(404, 'not found');
	return { p: pt.payload as Record<string, unknown> };
};
