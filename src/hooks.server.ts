import type { Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { decode_session } from '$lib/server/session';

export const handle: Handle = async ({ event, resolve }) => {
	const session_id = event.cookies.get('session');
	event.locals.user = null;
	if (session_id) {
		const s = await decode_session(env.SECRET, session_id);
		if (s) event.locals.user = s;
		else event.cookies.delete('session', { path: '/' });
	}
	return resolve(event);
};
