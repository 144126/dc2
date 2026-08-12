import { scroll, retrieve_one, upsert_novec, set_payload, uuid_from, ensure, type QEnv } from './qdrant';
import {
	conv_id,
	preview,
	norm,
	unread_key,
	conv_filter,
	search_filter,
	thread_filter,
	type Conv,
	type Msg
} from '$lib/chat';

export const conv_uuid = (cv: string): Promise<string> => uuid_from('conv:' + cv);

export async function get_conv(env: QEnv, id: string): Promise<Conv | null> {
	const pt = await retrieve_one(env, id);
	if (!pt?.payload || pt.payload.t !== 'cv') return null;
	return pt.payload as unknown as Conv;
}

export async function list_convs(env: QEnv, me: string): Promise<Conv[]> {
	await ensure(env);
	const pts = await scroll(env, conv_filter(me), 200, { key: 'md', direction: 'desc' });
	return pts.map((p) => p.payload as unknown as Conv);
}

export async function get_thread(env: QEnv, cv: string, after?: number): Promise<Msg[]> {
	await ensure(env);
	const pts = await scroll(env, thread_filter(cv, after), 500, { key: 'md', direction: 'asc' });
	return pts.map((p) => p.payload as unknown as Msg);
}

export async function search_msgs(env: QEnv, me: string, q: string): Promise<Msg[]> {
	if (!q.trim()) return [];
	await ensure(env);
	const pts = await scroll(env, search_filter(me, q), 60, { key: 'md', direction: 'desc' });
	return pts.map((p) => p.payload as unknown as Msg);
}

export async function send_msg(
	env: QEnv,
	from: string,
	to: string,
	text: string,
	pg: string,
	pn: string
): Promise<{ id: string; cv: string; m: Msg }> {
	await ensure(env);
	const mf = norm(from);
	const mt = norm(to);
	const cv = conv_id(mf, mt);
	const md = Date.now();
	const m: Msg = { cv, mf, mt, mx: text, md, pg };
	await upsert_novec(env, [{ id: crypto.randomUUID(), payload: { s: 'adca', t: 'm', ...m } }]);
	const id = await conv_uuid(cv);
	const was = await get_conv(env, id);
	const [ma, mb] = cv.split('|');
	const next: Conv = {
		cv,
		ma,
		mb,
		pg: was?.pg || pg,
		pn: was?.pn || pn,
		mx: preview(text),
		md,
		ua: Number(was?.ua ?? 0),
		ub: Number(was?.ub ?? 0)
	};
	next[unread_key(next, mt)] += 1;
	await upsert_novec(env, [{ id, payload: { s: 'adca', t: 'cv', ...next } }]);
	return { id, cv, m };
}

export async function mark_read(env: QEnv, c: Conv, me: string): Promise<void> {
	const k = unread_key(c, me);
	if (!Number(c[k] ?? 0)) return;
	await set_payload(env, await conv_uuid(c.cv), { [k]: 0 });
}

// ponytail: unread_total scrolls every conversation the user is in on every page load.
// Fine at this scale; move the counter into its own row, or a Durable Object like x2's
// ChatHub, if a person ever has hundreds of threads.
export async function unread_total(env: QEnv, me: string): Promise<number> {
	const convs = await list_convs(env, me);
	return convs.reduce((n, c) => n + Number(c[unread_key(c, me)] ?? 0), 0);
}
