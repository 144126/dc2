import { get_secret, b64u, unb64u, type SecretVal } from './qdrant';

async function get_key(secret: string): Promise<CryptoKey> {
	const raw = new TextEncoder().encode(secret).slice(0, 32);
	return crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, [
		'sign',
		'verify'
	]);
}

export async function encode_session(secret: SecretVal, email: string): Promise<string> {
	const p = { m: email, x: Date.now() + 604800000 };
	const raw = b64u(new TextEncoder().encode(JSON.stringify(p)));
	const k = await get_key(await get_secret(secret));
	const sig = await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(raw));
	return raw + '.' + b64u(sig);
}

export async function decode_session(
	secret: SecretVal,
	c: string | undefined | null
): Promise<{ e: string } | null> {
	if (!c) return null;
	const [raw, sig] = c.split('.');
	if (!raw || !sig) return null;
	try {
		const k = await get_key(await get_secret(secret));
		const sig_buf = unb64u(sig).buffer as ArrayBuffer;
		const valid = await crypto.subtle.verify('HMAC', k, sig_buf, new TextEncoder().encode(raw));
		if (!valid) return null;
		const p = JSON.parse(new TextDecoder().decode(unb64u(raw)));
		if (p.x < Date.now()) return null;
		return { e: p.m };
	} catch {
		return null;
	}
}
