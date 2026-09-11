import { scroll, upsert_novec, uuid_from, ensure, remove, type QEnv } from './qdrant';
import { preview } from '$lib/chat';
import { tag_list } from '$lib/people';
import {
	room_filter,
	room_one_filter,
	room_msg_filter,
	room_ok,
	room_slug,
	next_room,
	in_room,
	type Room,
	type Rmsg
} from '$lib/room';

const room_id = (hn: string): Promise<string> => uuid_from('rm:' + hn);

const as_list = (v: unknown): string[] =>
	Array.isArray(v) ? v.map((x) => String(x)).filter(Boolean) : [];

const to_room = (p: Record<string, unknown>): Room => ({
	hn: String(p.hn ?? ''),
	nm: String(p.nm ?? ''),
	ds: String(p.ds ?? ''),
	ow: String(p.ow ?? ''),
	mb: as_list(p.mb).map((e) => e.toLowerCase()),
	tg: as_list(p.tg),
	mx: String(p.mx ?? ''),
	md: Number(p.md ?? 0),
	j: Number(p.j ?? 0)
});

const put = async (env: QEnv, r: Room): Promise<void> => {
	await upsert_novec(env, [
		{ id: await room_id(r.hn), payload: { s: 'adca', t: 'rm', ...r } }
	]);
};

export async function list_rooms(env: QEnv): Promise<Room[]> {
	await ensure(env);
	const pts = await scroll(env, room_filter(), 200, { key: 'md', direction: 'desc' });
	return pts.map((p) => to_room(p.payload as Record<string, unknown>));
}

export async function get_room(env: QEnv, hn: string): Promise<Room | null> {
	await ensure(env);
	const pts = await scroll(env, room_one_filter(hn), 1);
	const p = pts[0]?.payload as Record<string, unknown> | undefined;
	return p ? to_room(p) : null;
}

export async function get_room_thread(env: QEnv, hn: string, after?: number): Promise<Rmsg[]> {
	await ensure(env);
	const pts = await scroll(env, room_msg_filter(hn, after), 500, { key: 'md', direction: 'asc' });
	return pts.map((p) => {
		const o = p.payload as Record<string, unknown>;
		return { rh: String(o.rh ?? ''), mf: String(o.mf ?? ''), mx: String(o.mx ?? ''), md: Number(o.md ?? 0) };
	});
}

async function taken(env: QEnv): Promise<string[]> {
	const pts = await scroll(env, room_filter(), 1000);
	return pts.map((p) => String((p.payload as Record<string, unknown>).hn ?? '')).filter(Boolean);
}

export async function save_room(
	env: QEnv,
	owner: string,
	data: { name: string; about?: string; tags?: string }
): Promise<{ ok: true; hn: string } | { ok: false; why: string }> {
	const nm = data.name.trim().slice(0, 60);
	const hn = next_room(room_slug(nm), await taken(env));
	if (!room_ok(hn)) return { ok: false, why: 'give the room a name with letters or numbers' };
	const now = Date.now();
	const me = owner.toLowerCase().trim();
	await ensure(env);
	await put(env, {
		hn,
		nm,
		ds: (data.about ?? '').trim().slice(0, 400),
		ow: me,
		mb: [me],
		tg: tag_list(data.tags ?? ''),
		mx: '',
		md: now,
		j: now
	});
	return { ok: true, hn };
}

export async function join_room(env: QEnv, hn: string, email: string): Promise<Room | null> {
	const r = await get_room(env, hn);
	if (!r) return null;
	const me = email.toLowerCase().trim();
	if (!in_room(r, me)) {
		r.mb = [...r.mb, me];
		await put(env, r);
	}
	return r;
}

export async function rooms_of(env: QEnv, email: string): Promise<Room[]> {
	const me = email.toLowerCase().trim();
	return (await list_rooms(env)).filter((r) => in_room(r, me));
}

export async function leave_room(env: QEnv, hn: string, email: string): Promise<Room | null> {
	const r = await get_room(env, hn);
	if (!r) return null;
	const me = email.toLowerCase().trim();
	if (r.ow === me) return r;
	r.mb = r.mb.filter((e) => e !== me);
	await put(env, r);
	return r;
}

export async function edit_room(
	env: QEnv,
	hn: string,
	email: string,
	data: { name?: string; about?: string; tags?: string }
): Promise<{ ok: true; hn: string } | { ok: false; why: string }> {
	const r = await get_room(env, hn);
	const me = email.toLowerCase().trim();
	if (!r || r.ow !== me) return { ok: false, why: 'only the person who started it can edit' };
	const nm = (data.name ?? r.nm).trim().slice(0, 60);
	if (!nm) return { ok: false, why: 'give the room a name with letters or numbers' };
	r.nm = nm;
	r.ds = (data.about ?? r.ds).trim().slice(0, 400);
	if (data.tags !== undefined) r.tg = tag_list(data.tags);
	await put(env, r);
	return { ok: true, hn: r.hn };
}

export async function drop_room(
	env: QEnv,
	hn: string,
	email: string
): Promise<{ ok: true } | { ok: false; why: string }> {
	const r = await get_room(env, hn);
	const me = email.toLowerCase().trim();
	if (!r || r.ow !== me) return { ok: false, why: 'only the person who started it can delete it' };
	const msgs = await scroll(env, room_msg_filter(hn), 500);
	for (const p of msgs) await remove(env, String(p.id));
	await remove(env, await room_id(hn));
	return { ok: true };
}

export async function send_room_msg(
	env: QEnv,
	hn: string,
	from: string,
	text: string
): Promise<{ m: Rmsg } | { why: string }> {
	const r = await get_room(env, hn);
	const me = from.toLowerCase().trim();
	if (!r || !in_room(r, me)) return { why: 'join the room first' };
	const mx = text.trim().slice(0, 4000);
	if (!mx) return { why: 'write something first' };
	const md = Date.now();
	const m: Rmsg = { rh: hn, mf: me, mx, md };
	await upsert_novec(env, [{ id: crypto.randomUUID(), payload: { s: 'adca', t: 'rg', ...m } }]);
	r.mx = preview(mx);
	r.md = md;
	await put(env, r);
	return { m };
}
