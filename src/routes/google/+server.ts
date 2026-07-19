import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { Google, generateState, generateCodeVerifier } from 'arctic';
import { get_secret } from '$lib/server/qdrant';
import { encode_session } from '$lib/server/session';

const google_client = async (origin: string) => {
	const raw_id = env.GOOGLE_ID;
	const raw_secret = env.GOOGLE_SECRET;
	console.log('[GOOGLE] constructing client...', {
		origin,
		id_type: typeof raw_id,
		id_has_get: typeof (raw_id as any)?.get === 'function',
		id_preview: String(raw_id).slice(0, 28) + '...',
		secret_preview: String(raw_secret).slice(0, 12) + '...'
	});
	const id = await get_secret(raw_id);
	const secret = await get_secret(raw_secret);
	const redirect_uri = new URL('/google', origin).toString();
	console.log('[GOOGLE] client constructed', { id_preview: id.slice(0, 28) + '...', redirect_uri });
	return new Google(id, secret, redirect_uri);
};

export const GET: RequestHandler = async ({ url, cookies, locals }) => {
	console.log('[GOOGLE] GET', { full_url: url.toString(), has_user: !!locals.user });
	if (locals.user) throw redirect(302, '/');

	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	console.log('[GOOGLE] params', { has_code: !!code, state });

	if (code) {
		const stored_state = cookies.get('oauth_state') ?? null;
		const stored_verifier = cookies.get('oauth_verifier') ?? null;
		console.log('[GOOGLE] callback cookies', {
			has_stored_state: !!stored_state,
			has_stored_verifier: !!stored_verifier,
			state_matches: state === stored_state
		});
		if (!state || !stored_state || !stored_verifier || state !== stored_state)
			throw error(400, 'bad_oauth');
		const g = await google_client(url.origin);
		let tokens: { accessToken(): string };
		try {
			console.log('[GOOGLE] validating authorization code...');
			tokens = await g.validateAuthorizationCode(code, stored_verifier);
			console.log('[GOOGLE] token validation succeeded');
		} catch (e) {
			console.log('[GOOGLE] token validation failed', { error: String(e), stack: (e as Error).stack });
			throw error(400, 'oauth_failed');
		}
		console.log('[GOOGLE] fetching userinfo...');
		const ures = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
			headers: { Authorization: `Bearer ${tokens.accessToken()}` }
		});
		console.log('[GOOGLE] userinfo response', { status: ures.status, ok: ures.ok });
		if (!ures.ok) {
			const body = await ures.text();
			console.log('[GOOGLE] userinfo body', { body });
			throw error(400, 'userinfo_failed');
		}
		const gu = (await ures.json()) as { email?: string };
		console.log('[GOOGLE] got email', { email: gu.email });
		const e = (gu.email ?? '').toLowerCase().trim();
		if (!e) throw error(400, 'no_email');
		const session = await encode_session(env.SECRET, e);
		cookies.set('session', session, { path: '/', httpOnly: true, maxAge: 604800, sameSite: 'lax' });
		cookies.delete('oauth_state', { path: '/' });
		cookies.delete('oauth_verifier', { path: '/' });
		console.log('[GOOGLE] session set, redirecting to /');
		throw redirect(302, '/');
	}

	const s = generateState();
	const verifier = generateCodeVerifier();
	const g = await google_client(url.origin);
	const auth_url = g.createAuthorizationURL(s, verifier, ['openid', 'email']);
	console.log('[GOOGLE] redirecting to auth_url', { auth_url: auth_url.toString() });
	cookies.set('oauth_state', s, { path: '/', httpOnly: true, maxAge: 600, sameSite: 'lax' });
	cookies.set('oauth_verifier', verifier, { path: '/', httpOnly: true, maxAge: 600, sameSite: 'lax' });
	console.log('[GOOGLE] redirecting...');
	throw redirect(302, auth_url.toString());
};
