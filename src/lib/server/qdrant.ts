import { QdrantClient } from '@qdrant/js-client-rest';
import type { Filter } from '../filter';

export type SecretVal = string | { get?: () => Promise<string> } | undefined;

export async function get_secret(v: SecretVal): Promise<string> {
	if (v && typeof (v as { get?: unknown }).get === 'function')
		return await (v as { get: () => Promise<string> }).get();
	return (v as string) ?? '';
}

export type QEnv = { QDRANT_URL?: SecretVal; QDRANT_KEY?: SecretVal };

export const b64u = (buf: ArrayBuffer | Uint8Array): string => {
	const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
	let s = '';
	for (const b of bytes) s += String.fromCharCode(b);
	return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
export const unb64u = (s: string): Uint8Array => {
	const t = s.replace(/-/g, '+').replace(/_/g, '/');
	const bin = atob(t.padEnd(Math.ceil(t.length / 4) * 4, '='));
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out;
};

let q: QdrantClient | null = null;
let q_key = '';

export async function qc(env: QEnv): Promise<QdrantClient> {
	const url = await get_secret(env.QDRANT_URL);
	const key = await get_secret(env.QDRANT_KEY);
	if (!q || q_key !== key) q = new QdrantClient({ url, apiKey: key, checkCompatibility: false });
	q_key = key;
	return q;
}

export const ZV: number[] = new Array(4096).fill(0);
export const C = 'i';
export const V = 'i';

export async function uuid_from(s: string): Promise<string> {
	const h = new Uint8Array(
		await crypto.subtle.digest('SHA-256', new TextEncoder().encode('adca:' + s))
	);
	const x = [...h.slice(0, 16)].map((b) => b.toString(16).padStart(2, '0')).join('');
	return `${x.slice(0, 8)}-${x.slice(8, 12)}-4${x.slice(13, 16)}-8${x.slice(17, 20)}-${x.slice(20, 32)}`;
}

export { eq, txt, rng, f, f_or } from '../filter';
export type { Cond, Filter } from '../filter';

type Pt = { id: string | number; payload: Record<string, unknown> | null };

let ensured = false;
export async function ensure(env: QEnv): Promise<void> {
	if (ensured) return;
	const c = await qc(env);
	for (const k of ['g', 's', 't', 'cv', 'mf', 'mt', 'ma', 'mb', 'pg'] as const)
		await c.createPayloadIndex(C, { field_name: k, field_schema: 'keyword' }).catch(() => {});
	await c.createPayloadIndex(C, { field_name: 'md', field_schema: 'integer' }).catch(() => {});
	await c
		.createPayloadIndex(C, {
			field_name: 'mx',
			field_schema: {
				type: 'text',
				tokenizer: 'word',
				lowercase: true,
				min_token_len: 2,
				max_token_len: 30
			}
		})
		.catch(() => {});
	ensured = true;
}

export async function scroll(
	env: QEnv,
	filter: Filter,
	limit = 1000,
	order_by?: { key: string; direction: 'asc' | 'desc' }
): Promise<Pt[]> {
	const r = await (await qc(env)).scroll(C, {
		filter,
		limit,
		with_payload: true,
		with_vector: false,
		...(order_by ? { order_by } : {})
	});
	return r.points as Pt[];
}

export async function retrieve_one(env: QEnv, id: string): Promise<Pt | null> {
	const r = await (await qc(env)).retrieve(C, { ids: [id] }).catch(() => []);
	return (r[0] as Pt) ?? null;
}

export async function upsert(
	env: QEnv,
	points: { id: string; payload: Record<string, unknown> }[]
): Promise<void> {
	if (!points.length) return;
	await (await qc(env)).upsert(C, { points: points.map((p) => ({ ...p, vector: { [V]: ZV } })) });
}

export async function upsert_novec(
	env: QEnv,
	points: { id: string; payload: Record<string, unknown> }[]
): Promise<void> {
	if (!points.length) return;
	await (await qc(env)).upsert(C, { points: points.map((p) => ({ ...p, vector: {} })) });
}

export async function set_payload(
	env: QEnv,
	id: string,
	payload: Record<string, unknown>
): Promise<void> {
	await (await qc(env)).setPayload(C, { payload, points: [id] });
}

export async function remove(env: QEnv, id: string): Promise<void> {
	await (await qc(env)).delete(C, { points: [id] });
}
