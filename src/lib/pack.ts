export type Disc = { x: number; y: number; r: number };

export const radius_for = (count: number, base = 22): number => base * Math.sqrt(Math.max(count, 0));

const clear = (discs: Disc[], x: number, y: number, r: number, gap: number) =>
	discs.every((d) => Math.hypot(d.x - x, d.y - y) >= d.r + r + gap - 0.001);

export function pack(radii: number[], gap = 6): Disc[] {
	const out: Disc[] = [];
	for (const r of radii) {
		if (!out.length) {
			out.push({ x: 0, y: 0, r });
			continue;
		}
		let best: Disc | null = null;
		let best_d = Infinity;
		for (const c of out) {
			for (let k = 0; k < 72; k++) {
				const a = (k * Math.PI) / 36;
				const x = c.x + (c.r + r + gap) * Math.cos(a);
				const y = c.y + (c.r + r + gap) * Math.sin(a);
				const d = x * x + y * y;
				if (d < best_d && clear(out, x, y, r, gap)) {
					best = { x, y, r };
					best_d = d;
				}
			}
		}
		out.push(best ?? { x: 0, y: 0, r });
	}
	return out;
}

export function view_box(discs: Disc[], pad = 4): string {
	if (!discs.length) return '0 0 1 1';
	const min_x = Math.min(...discs.map((d) => d.x - d.r)) - pad;
	const min_y = Math.min(...discs.map((d) => d.y - d.r)) - pad;
	const max_x = Math.max(...discs.map((d) => d.x + d.r)) + pad;
	const max_y = Math.max(...discs.map((d) => d.y + d.r)) + pad;
	return `${min_x} ${min_y} ${max_x - min_x} ${max_y - min_y}`;
}
