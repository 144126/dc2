import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { scroll, eq, f } from '$lib/server/qdrant';

export const load: PageServerLoad = async () => {
	try {
		const pts = await scroll(env, f(eq('s', 'adca'), eq('t', 'p'), eq('ra', 'y')));
		const p = pts.map((pt) => {
			const x = pt.payload as Record<string, string>;
			delete x.e;
			return x;
		});
		return { p };
	} catch {
		return { p: [] as Record<string, string>[] };
	}
};
