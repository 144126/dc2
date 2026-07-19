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

const ZV = new Array(3072).fill(0);
const j = Math.floor(Date.now() / 1000);

const points = seed.products.map((p) => ({
	id: uuid_from(p.g),
	vector: ZV,
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
		d: '',
		q: '',
		m: '',
		a: '',
		z: '',
		k: '',
		b: { n: '', e: '', p: '', l: '', c: '' },
		j
	}
}));

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
