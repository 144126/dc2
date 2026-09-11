import { scroll, retrieve_one, upsert_novec, uuid_from, ensure, eq, f, type QEnv } from './qdrant';
import { default_handle, next_handle, slug_handle, handle_ok, type Prof } from '$lib/profile';
import { tag_list } from '$lib/people';
import { label, type Who } from '$lib/who';
import { by_momentum, type P } from '$lib/investor';

const row_id = (email: string): Promise<string> => uuid_from('bu:' + email.toLowerCase().trim());

const as_tags = (v: unknown): string[] =>
	Array.isArray(v) ? tag_list(v.join(',')) : tag_list(String(v ?? ''));

const to_prof = (p: Record<string, unknown>): Prof => ({
	hn: String(p.hn ?? ''),
	nm: String(p.nm ?? ''),
	bo: String(p.bo ?? ''),
	pf: String(p.pf ?? ''),
	cb: String(p.cb ?? ''),
	lc: String(p.lc ?? ''),
	lk: String(p.lk ?? ''),
	li: String(p.li ?? ''),
	tg: as_tags(p.tg),
	j: Number(p.j ?? 0)
});

export async function products_of(env: QEnv, email: string): Promise<P[]> {
	const pts = await scroll(env, f(eq('s', 'adca'), eq('t', 'p'), eq('e', email.toLowerCase())), 200);
	return pts
		.map((x) => {
			const o = { ...(x.payload as Record<string, string>) };
			delete o.e;
			return o;
		})
		.sort(by_momentum);
}

export async function by_email(env: QEnv, email: string): Promise<Prof | null> {
	const pt = await retrieve_one(env, await row_id(email));
	if (!pt?.payload || pt.payload.t !== 'bu') return null;
	return to_prof(pt.payload);
}

export async function by_handle(
	env: QEnv,
	handle: string
): Promise<{ prof: Prof; email: string } | null> {
	await ensure(env);
	const pts = await scroll(env, f(eq('s', 'adca'), eq('t', 'bu'), eq('hn', handle)), 1);
	const p = pts[0]?.payload as Record<string, unknown> | undefined;
	if (!p) return null;
	return { prof: to_prof(p), email: String(p.e ?? '') };
}

async function taken(env: QEnv): Promise<string[]> {
	const pts = await scroll(env, f(eq('s', 'adca'), eq('t', 'bu')), 1000);
	return pts.map((x) => String((x.payload as Record<string, unknown>).hn ?? '')).filter(Boolean);
}

// A builder only reaches this page after signing in, so the row is created on first read
// rather than asking them to claim a handle before they can see anything.
export async function ensure_profile(env: QEnv, email: string): Promise<Prof> {
	const was = await by_email(env, email);
	if (was) return was;
	await ensure(env);
	const products = await products_of(env, email);
	const prof: Prof = {
		hn: next_handle(default_handle(email), await taken(env)),
		nm: '',
		bo: '',
		pf: '',
		cb: '',
		lc: '',
		lk: '',
		li: '',
		tg: [],
		j: products.reduce(
			(min, p) => (Number(p.j) > 0 && (min === 0 || Number(p.j) < min) ? Number(p.j) : min),
			0
		)
	};
	await upsert_novec(env, [
		{ id: await row_id(email), payload: { s: 'adca', t: 'bu', e: email.toLowerCase(), ...prof } }
	]);
	return prof;
}

export async function save_profile(
	env: QEnv,
	email: string,
	next: Partial<Prof> & { hn: string }
): Promise<{ ok: true; hn: string } | { ok: false; why: string }> {
	const was = await ensure_profile(env, email);
	const hn = slug_handle(next.hn);
	if (!handle_ok(hn)) return { ok: false, why: 'a handle is 2 to 24 letters, numbers or hyphens' };
	if (hn !== was.hn) {
		const other = await by_handle(env, hn);
		if (other && other.email !== email.toLowerCase())
			return { ok: false, why: 'that handle is taken' };
	}
	const prof: Prof = { ...was, ...next, hn };
	await upsert_novec(env, [
		{ id: await row_id(email), payload: { s: 'adca', t: 'bu', e: email.toLowerCase(), ...prof } }
	]);
	return { ok: true, hn };
}

export async function who_of(env: QEnv, emails: string[]): Promise<Record<string, Who>> {
	const want = [...new Set(emails.map((e) => e.toLowerCase().trim()).filter(Boolean))];
	if (!want.length) return {};
	await ensure(env);
	const pts = await scroll(env, f(eq('s', 'adca'), eq('t', 'bu')), 1000);
	const out: Record<string, Who> = {};
	for (const pt of pts) {
		const p = pt.payload as Record<string, unknown> | null;
		const e = String(p?.e ?? '').toLowerCase();
		if (!want.includes(e)) continue;
		out[e] = { e, hn: String(p?.hn ?? ''), nm: String(p?.nm ?? '') };
	}
	return out;
}

export const who_label = (map: Record<string, Who>, email: string): string =>
	label(map[email.toLowerCase().trim()], email);
