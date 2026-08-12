import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { list_convs, search_msgs, conv_uuid } from '$lib/server/chat';
import { norm, peer_of, unread_of } from '$lib/chat';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.user) throw redirect(302, '/google?next=/inbox');
	const me = norm(locals.user.e);
	const q = (url.searchParams.get('q') ?? '').trim();
	const convs = await list_convs(env, me);
	const rows = await Promise.all(
		convs.map(async (c) => ({
			id: await conv_uuid(c.cv),
			pg: c.pg,
			pn: c.pn,
			who: peer_of(c, me),
			mx: c.mx,
			md: c.md,
			un: unread_of(c, me)
		}))
	);
	if (!q) return { q, rows, hits: [] };
	const by_cv = new Map(convs.map((c) => [c.cv, c]));
	const hits = await Promise.all(
		(await search_msgs(env, me, q)).map(async (m) => {
			const c = by_cv.get(m.cv);
			return {
				id: c ? await conv_uuid(c.cv) : '',
				pn: c?.pn ?? '',
				who: m.mf === me ? m.mt : m.mf,
				mine: m.mf === me,
				mx: m.mx,
				md: m.md
			};
		})
	);
	return { q, rows, hits: hits.filter((h) => h.id) };
};
