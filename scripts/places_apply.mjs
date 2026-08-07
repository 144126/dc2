import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const env = {};
for (const l of readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n'))
	if (l.includes('=')) env[l.slice(0, l.indexOf('=')).trim()] = l.slice(l.indexOf('=') + 1).trim();

const uuid_from = (s) => {
	const h = createHash('sha256').update('adca:' + s).digest('hex');
	return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
};

const rows = JSON.parse(readFileSync(new URL('./places.json', import.meta.url), 'utf8'));

for (const { g, co, st } of rows) {
	const res = await fetch(env.QDRANT_URL + '/collections/i/points/payload?wait=true', {
		method: 'POST',
		headers: { 'content-type': 'application/json', 'api-key': env.QDRANT_KEY },
		body: JSON.stringify({ payload: { co, st }, points: [uuid_from(g)] })
	});
	console.log(g, co, st || '(no state)', res.status);
}
console.log('placed', rows.length);
