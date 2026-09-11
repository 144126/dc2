import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { list_people } from '$lib/server/people';
import { sector_order } from '$lib/sectors';

export const load: PageServerLoad = async ({ locals, url }) => {
	const q = (url.searchParams.get('q') ?? '').trim();
	const c = (url.searchParams.get('c') ?? '').trim();
	const sector = (sector_order as readonly string[]).includes(c) ? c : '';
	const people = await list_people(env, q, locals.user?.e, sector);
	return { q, c: sector, people, signed_in: !!locals.user };
};
