import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { scroll, eq, f } from '$lib/server/qdrant';

export const GET: RequestHandler = async () => {
	const base = 'https://devcircles.apexlinks.org';
	let slugs: string[] = [];
	let rooms: string[] = [];
	let people: string[] = [];
	try {
		const pts = await scroll(env, f(eq('s', 'adca'), eq('t', 'p')));
		slugs = pts.map((pt) => (pt.payload as Record<string, string>).g).filter(Boolean);
		const rms = await scroll(env, f(eq('s', 'adca'), eq('t', 'rm')));
		rooms = rms.map((pt) => (pt.payload as Record<string, string>).hn).filter(Boolean);
		const bus = await scroll(env, f(eq('s', 'adca'), eq('t', 'bu')));
		people = bus.map((pt) => (pt.payload as Record<string, string>).hn).filter(Boolean);
	} catch {
		// sitemap degrades to just the homepage if qdrant is unreachable
	}

	const urls = [
		base + '/',
		base + '/people',
		base + '/r',
		...slugs.map((g) => `${base}/${g}`),
		...rooms.map((h) => `${base}/r/${h}`),
		...people.map((h) => `${base}/u/${h}`)
	]
		.map((u) => `<url><loc>${u}</loc></url>`)
		.join('');

	const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

	return new Response(body, {
		headers: { 'Content-Type': 'application/xml', 'Cache-Control': 'max-age=3600' }
	});
};
