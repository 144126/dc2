import { readFileSync, writeFileSync } from 'node:fs';

const env = {};
for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n'))
	if (l.includes('=')) env[l.slice(0, l.indexOf('=')).trim()] = l.slice(l.indexOf('=') + 1).trim();

const UA =
	'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';

const res = await fetch(env.QDRANT_URL + '/collections/i/points/scroll', {
	method: 'POST',
	headers: { 'content-type': 'application/json', 'api-key': env.QDRANT_KEY },
	body: JSON.stringify({
		filter: { must: [{ key: 's', match: { value: 'adca' } }, { key: 't', match: { value: 'p' } }] },
		limit: 500,
		with_payload: true,
		with_vector: false
	})
});
const products = (await res.json()).result.points.map((p) => p.payload);

const probe = async (p) => {
	const out = { g: p.g, u: p.u, ok: false, status: 0, title: '', pricing: false, signup: false, app: '' };
	if (!p.u) return out;
	try {
		const r = await fetch(p.u, { headers: { 'user-agent': UA }, redirect: 'follow', signal: AbortSignal.timeout(25000) });
		out.status = r.status;
		out.ok = r.ok;
		const html = await r.text();
		out.title = (html.match(/<title[^>]*>([^<]{0,160})/i)?.[1] ?? '').trim();
		const text = html.toLowerCase();
		out.pricing = /pricing|\bplans?\b|per month|\/mo\b|₦|subscribe/.test(text);
		out.signup = /sign ?up|get started|create (an )?account|register|join/.test(text);
		out.app = html.match(/https?:\/\/(play\.google\.com|apps\.apple\.com)\/[^"'\s<]+/i)?.[0] ?? '';
	} catch (err) {
		out.error = String(err.message ?? err);
	}
	return out;
};

const results = [];
for (const p of products) {
	const r = await probe(p);
	results.push(r);
	console.log(r.g, r.status || r.error || '', r.ok ? 'ok' : 'FAIL');
}

writeFileSync(
	new URL('../plan/data/probe.json', import.meta.url),
	JSON.stringify({ checked: new Date().toISOString().slice(0, 10), results }, null, 1)
);
console.log('probed', results.length);
