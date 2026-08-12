import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { retrieve_one, uuid_from } from '$lib/server/qdrant';
import { get_conv, get_thread, send_msg } from '$lib/server/chat';
import { in_conv, norm, peer_of } from '$lib/chat';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'sign in to send a message');
	const body = (await request.json()) as { pg?: string; id?: string; x?: string };
	const text = (body.x ?? '').trim().slice(0, 4000);
	if (!text) throw error(400, 'write something first');
	const me = norm(locals.user.e);

	if (body.id) {
		const c = await get_conv(env, body.id);
		if (!c || !in_conv(c, me)) throw error(403, 'not your conversation');
		const r = await send_msg(env, me, peer_of(c, me), text, c.pg, c.pn);
		return json({ id: r.id, m: r.m });
	}

	const slug = (body.pg ?? '').trim();
	if (!slug) throw error(400, 'no product given');
	const pt = await retrieve_one(env, await uuid_from(slug));
	const p = pt?.payload as Record<string, string> | undefined;
	if (!p || p.t !== 'p') throw error(404, 'no such product');
	const owner = norm(p.e ?? '');
	if (!owner) throw error(400, 'this product has no builder to message yet');
	if (owner === me) throw error(400, 'that is your own product');
	const r = await send_msg(env, me, owner, text, slug, p.n ?? slug);
	return json({ id: r.id, m: r.m });
};

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) throw error(401, 'sign in');
	const id = (url.searchParams.get('id') ?? '').trim();
	if (!id) throw error(400, 'no conversation given');
	const c = await get_conv(env, id);
	const me = norm(locals.user.e);
	if (!c || !in_conv(c, me)) throw error(403, 'not your conversation');
	return json({ m: await get_thread(env, c.cv, Number(url.searchParams.get('after') ?? 0) || 0) });
};
