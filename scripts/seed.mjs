import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const env = {};
for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n'))
	if (l.includes('=')) env[l.slice(0, l.indexOf('=')).trim()] = l.slice(l.indexOf('=') + 1).trim();

const seed = JSON.parse(readFileSync(new URL('../seed.json', import.meta.url), 'utf8'));

const sector_map = {
	fintech: 'f',
	commerce: 'm',
	ai: 'a',
	saas: 'b',
	devtools: 'd',
	social: 'z',
	education: 'e',
	services: 'v',
	early: 'y'
};

const uuid_from = (s) => {
	const h = createHash('sha256').update('adca:' + s).digest('hex');
	return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
};

const ZV = new Array(4096).fill(0);
const j = Math.floor(Date.now() / 1000);

const live = await fetch(env.QDRANT_URL + '/collections/i/points/scroll', {
	method: 'POST',
	headers: { 'content-type': 'application/json', 'api-key': env.QDRANT_KEY },
	body: JSON.stringify({
		filter: { must: [{ key: 's', match: { value: 'adca' } }, { key: 't', match: { value: 'p' } }] },
		limit: 500,
		with_payload: true,
		with_vector: false
	})
})
	.then((r) => r.json())
	.then((r) => Object.fromEntries(r.result.points.map((pt) => [pt.payload.g, pt.payload])));

const points = seed.products.map((p) => {
	const was = live[p.g] ?? {};
	return {
		id: uuid_from(p.g),
		vector: { i: ZV },
		payload: {
			s: 'adca',
			t: 'p',
			g: p.g,
			n: p.n,
			u: p.u ?? '',
			l: p.l ?? '',
			r: p.r,
			c: sector_map[p.c],
			o: p.o,
			w: p.w,
			h: p.h ?? '',
			x: p.x ?? '',
			d: was.d ?? '',
			q: was.q ?? '',
			m: was.m ?? '',
			a: was.a ?? '',
			z: was.z ?? '',
			k: was.k ?? '',
			e: was.e ?? '',
			hm: was.hm ?? '',
			hl: was.hl ?? '',
			hv: was.hv ?? '',
			sg: was.sg ?? '',
			ra: was.ra ?? '',
			rt: was.rt ?? '',
			fp: was.fp ?? '',
			ev: was.ev ?? '',
			vd: was.vd ?? '',
			hj: was.hj ?? '',
			co: was.co ?? '',
			st: was.st ?? '',
			b: was.b ?? { n: '', e: '', p: '', l: '', c: '' },
			j
		}
	};
});

for (const [k, v] of Object.entries(seed.sectors))
	points.push({
		id: uuid_from('sector:' + sector_map[k]),
		vector: { i: ZV },
		payload: { s: 'adca', t: 'sec', g: sector_map[k], n: v.n.toLowerCase(), j: 0 }
	});

const res = await fetch(env.QDRANT_URL + '/collections/i/points?wait=true', {
	method: 'PUT',
	headers: { 'content-type': 'application/json', 'api-key': env.QDRANT_KEY },
	body: JSON.stringify({ points })
});
console.log(res.status, await res.text());

await fetch(env.QDRANT_URL + '/collections/i/index', {
	method: 'PUT',
	headers: { 'content-type': 'application/json', 'api-key': env.QDRANT_KEY },
	body: JSON.stringify({ field_name: 'g', field_schema: 'keyword' })
}).catch(() => {});
