import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { scroll, eq, f } from '$lib/server/qdrant';

export const load: PageServerLoad = async () => {
	const pts = await scroll(env, f(eq('s', 'adca'), eq('t', 'p')));
	const p = pts.map((pt) => pt.payload) as Record<string, string>[];
	return { p };
};
