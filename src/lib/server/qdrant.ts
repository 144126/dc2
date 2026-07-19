import { QdrantClient } from '@qdrant/js-client-rest';

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

export const ZV: number[] = new Array(3072).fill(0);
export const C = 'i';

export async function uuid_from(s: string): Promise<string> {
	const h = new Uint8Array(
		await crypto.subtle.digest('SHA-256', new TextEncoder().encode('adca:' + s))
	);
	const x = [...h.slice(0, 16)].map((b) => b.toString(16).padStart(2, '0')).join('');
	return `${x.slice(0, 8)}-${x.slice(8, 12)}-4${x.slice(13, 16)}-8${x.slice(17, 20)}-${x.slice(20, 32)}`;
}

export type Cond =
	| { key: string; match: { value: string | number } }
	| { key: string; range: { gte?: number; lte?: number } };
export const eq = (key: string, value: string | number): Cond => ({ key, match: { value } });
export const f = (...conds: Cond[]) => ({ must: conds });

type Pt = { id: string | number; payload: Record<string, unknown> | null };

let ensured = false;
export async function ensure(env: QEnv): Promise<void> {
	if (ensured) return;
	const c = await qc(env);
	await c.createPayloadIndex(C, { field_name: 'g', field_schema: 'keyword' }).catch(() => {});
	ensured = true;
}

export async function scroll(
	env: QEnv,
	filter: ReturnType<typeof f>,
	limit = 1000
): Promise<Pt[]> {
	const r = await (await qc(env))
		.scroll(C, { filter, limit, with_payload: true, with_vector: false })
		.catch(() => ({ points: [] as Pt[] }));
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
	await (await qc(env)).upsert(C, { points: points.map((p) => ({ ...p, vector: ZV })) });
}
