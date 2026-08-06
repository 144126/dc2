import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () =>
	new Response(
		`User-agent: *\nAllow: /\nDisallow: /submit\nDisallow: /api/\nSitemap: https://devcircles.apexlinks.org/sitemap.xml\n`,
		{ headers: { 'content-type': 'text/plain' } }
	);
