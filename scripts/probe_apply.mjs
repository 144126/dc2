import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const env = {};
for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n'))
	if (l.includes('=')) env[l.slice(0, l.indexOf('=')).trim()] = l.slice(l.indexOf('=') + 1).trim();

const uuid_from = (s) => {
	const h = createHash('sha256').update('adca:' + s).digest('hex');
	return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
};

const { checked, results } = JSON.parse(
	readFileSync(new URL('../plan/data/probe.json', import.meta.url), 'utf8')
);

for (const r of results) {
	const bits = [];
	if (r.ok) bits.push('link reachable');
	else bits.push('link did not respond');
	if (r.pricing) bits.push('public pricing');
	if (r.signup) bits.push('open signup');
	if (r.app) bits.push('mobile app listing');
	const payload = { vd: checked, ev: bits.join(' · ') };
	const res = await fetch(env.QDRANT_URL + '/collections/i/points/payload?wait=true', {
		method: 'POST',
		headers: { 'content-type': 'application/json', 'api-key': env.QDRANT_KEY },
		body: JSON.stringify({ payload, points: [uuid_from(r.g)] })
	});
	console.log(r.g, payload.ev, res.status);
}

console.log('\nreview these by hand — probe disagrees with stored status:');
for (const r of results) if (!r.ok) console.log(' ', r.g, r.status || r.error);
