import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { upsert, uuid_from } from '$lib/server/qdrant';

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json()) as Record<string, string>;
	const pg = (body.pg ?? '').trim();
	const nm = (body.nm ?? '').trim();
	const em = (body.em ?? '').trim();
	if (!pg || !nm || !em) throw error(400, 'name, email and product are required');
	if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(em)) throw error(400, 'that email does not look right');

	const j = Math.floor(Date.now() / 1000);
	const id = await uuid_from(`interest:${pg}:${em.toLowerCase()}:${j}`);
	await upsert(env, [
		{
			id,
			payload: {
				s: 'adca',
				t: 'x',
				pg,
				nm,
				em: em.toLowerCase(),
				fm: (body.fm ?? '').trim().slice(0, 200),
				ms: (body.ms ?? '').trim().slice(0, 2000),
				j
			}
		}
	]);
	return json({ ok: true });
};
