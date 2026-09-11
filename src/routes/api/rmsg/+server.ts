import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { get_room, get_room_thread, send_room_msg } from '$lib/server/room';
import { in_room } from '$lib/room';
import { norm } from '$lib/chat';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'sign in to send a message');
	const body = (await request.json()) as { hn?: string; x?: string };
	const hn = (body.hn ?? '').trim();
	const text = (body.x ?? '').trim().slice(0, 4000);
	if (!hn) throw error(400, 'no room given');
	const out = await send_room_msg(env, hn, locals.user.e, text);
	if ('why' in out) throw error(400, out.why);
	return json({ m: out.m });
};

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) throw error(401, 'sign in');
	const hn = (url.searchParams.get('hn') ?? '').trim();
	if (!hn) throw error(400, 'no room given');
	const r = await get_room(env, hn);
	const me = norm(locals.user.e);
	if (!r || !in_room(r, me)) throw error(403, 'join the room first');
	return json({
		m: await get_room_thread(env, hn, Number(url.searchParams.get('after') ?? 0) || 0)
	});
};
