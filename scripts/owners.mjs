import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const env = {};
for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n'))
	if (l.includes('=')) env[l.slice(0, l.indexOf('=')).trim()] = l.slice(l.indexOf('=') + 1).trim();

const uuid_from = (s) => {
	const h = createHash('sha256').update('adca:' + s).digest('hex');
	return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
};

const owners = JSON.parse(readFileSync(new URL('../owners.json', import.meta.url), 'utf8'));

const res = await fetch(env.QDRANT_URL + '/collections/i/points/scroll', {
	method: 'POST',
	headers: { 'content-type': 'application/json', 'api-key': env.QDRANT_KEY },
	body: JSON.stringify({
		filter: { must: [{ key: 's', match: { value: 'adca' } }, { key: 't', match: { value: 'p' } }] },
		limit: 200,
		with_payload: true,
		with_vector: false
	})
});
const points = (await res.json()).result.points;

for (const o of owners) {
	const e = (o.e ?? '').toLowerCase().trim();
	if (!e) continue;
	const id = o.g ? uuid_from(o.g) : points.find((pt) => pt.payload.u === o.u)?.id;
	if (!id) {
		console.log('no match', o);
		continue;
	}
	const r = await fetch(env.QDRANT_URL + '/collections/i/points/payload?wait=true', {
		method: 'POST',
		headers: { 'content-type': 'application/json', 'api-key': env.QDRANT_KEY },
		body: JSON.stringify({ payload: { e }, points: [id] })
	});
	console.log(id, e, r.status);
}
