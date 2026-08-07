import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { scroll, upsert, eq, f, uuid_from, get_secret, type QEnv, type SecretVal } from './qdrant';
import { sector_order, sector_info } from '$lib/sectors';

export type Sector = { g: string; n: string };

import { slugify } from '$lib/places';
export { slugify };

let seeded = false;
async function seed(env: QEnv) {
	if (seeded) return;
	seeded = true;
	const pts = await Promise.all(
		sector_order.map(async (g) => ({
			id: await uuid_from('sector:' + g),
			payload: { s: 'adca', t: 'sec', g, n: sector_info[g].n, j: 0 }
		}))
	);
	await upsert(env, pts);
}

export async function list_sectors(env: QEnv): Promise<Sector[]> {
	await seed(env);
	const pts = await scroll(env, f(eq('s', 'adca'), eq('t', 'sec')), 500);
	return (pts.map((p) => p.payload) as Sector[])
		.filter((s) => s?.g && s?.n)
		.sort((a, b) => a.n.localeCompare(b.n));
}

export async function add_sector(env: QEnv, name: string, existing: Sector[]): Promise<Sector> {
	const taken = new Set(existing.map((s) => s.g));
	let g = slugify(name);
	if (!g) g = 'sector';
	if (taken.has(g)) {
		let i = 2;
		while (taken.has(`${g}-${i}`)) i++;
		g = `${g}-${i}`;
	}
	const sector: Sector = { g, n: name };
	await upsert(env, [
		{ id: await uuid_from('sector:' + g), payload: { s: 'adca', t: 'sec', ...sector, j: Math.floor(Date.now() / 1000) } }
	]);
	return sector;
}

export type GeminiEnv = QEnv & { GEMINI?: SecretVal };

export async function find_similar_sector(
	env: GeminiEnv,
	name: string,
	existing: Sector[]
): Promise<Sector | null> {
	const key = await get_secret(env.GEMINI);
	if (!key || !existing.length) return null;

	const list = existing.map((s) => `${s.g}: ${s.n}`).join('\n');
	const prompt = `You maintain a list of product sector categories for a developer community directory.
Existing sectors (code: name):
${list}

A user wants to add a new sector called "${name}".
Is this the same sector (or an obvious near-duplicate / synonym) as one already in the list above?
Reply with EXACTLY one line:
- "MATCH:<code>" if it clearly duplicates an existing sector (use its code)
- "NEW" if it is genuinely distinct

Reply with nothing else.`;

	try {
		const google = createGoogleGenerativeAI({ apiKey: key });
		const { text } = await generateText({ model: google('gemini-2.5-flash'), prompt });
		const m = text.trim().match(/^MATCH:(.+)$/i);
		if (!m) return null;
		const code = m[1].trim();
		return existing.find((s) => s.g === code) ?? null;
	} catch {
		return null;
	}
}
