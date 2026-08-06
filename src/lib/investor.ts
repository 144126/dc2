export const stage_label: Record<string, string> = {
	i: 'idea',
	b: 'in beta',
	l: 'launched',
	r: 'making revenue',
	s: 'scaling'
};

export const raise_label: Record<string, string> = { y: 'raising now', n: 'not raising' };

export const verify_label: Record<string, string> = {
	v: 'verified by devcircles',
	s: 'self-reported'
};

export type P = Record<string, string>;

const stage_points: Record<string, number> = { s: 20, r: 16, l: 10, b: 5, i: 0 };
const status_points: Record<string, number> = { l: 8, p: 3, u: 0 };

const log_points = (v: string | undefined, mult: number, cap: number): number => {
	const n = Number(v);
	if (!Number.isFinite(n) || n <= 0) return 0;
	return Math.min(cap, Math.round(Math.log10(n) * mult));
};

export const age_days = (hj: string | undefined, now = Date.now()): number | null => {
	const t = Number(hj);
	if (!Number.isFinite(t) || t <= 0) return null;
	return Math.floor((now / 1000 - t) / 86400);
};

export const freshness = (hj: string | undefined, now = Date.now()): number => {
	const d = age_days(hj, now);
	if (d === null) return 0.5;
	if (d <= 90) return 1;
	if (d <= 180) return 0.5;
	return 0;
};

export const is_fresh = (p: P, now = Date.now()): boolean => freshness(p.hj, now) > 0;

export const as_of = (hj: string | undefined): string => {
	const t = Number(hj);
	if (!Number.isFinite(t) || t <= 0) return 'date not given';
	return (
		'as of ' +
		new Date(t * 1000)
			.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })
			.toLowerCase()
	);
};

export const momentum = (p: P, now = Date.now()): number =>
	Math.round(
		freshness(p.hj, now) *
			((p.hm ? 10 : 0) +
				(p.hv === 'v' ? 5 : 0) +
				(p.m === 'y' ? 20 : 0) +
				log_points(p.a, 4, 20) +
				log_points(p.q, 5, 20) +
				(stage_points[p.sg] ?? 0) +
				(p.ra === 'y' ? 6 : 0))
	) + (status_points[p.r] ?? 0);

export const by_momentum = (a: P, b: P, now = Date.now()): number =>
	momentum(b, now) - momentum(a, now) || (a.n ?? '').localeCompare(b.n ?? '');

export const headline = (p: P): { v: string; l: string; hv: string; hj: string } | null => {
	const hj = p.hj ?? '';
	if (p.hm) return { v: p.hm, l: p.hl || 'headline metric', hv: p.hv || 's', hj };
	if (p.k) return { v: p.k, l: 'proudest metric', hv: 's', hj };
	if (p.q) return { v: p.q, l: 'users', hv: 's', hj };
	if (p.m === 'y' && p.a) return { v: p.a, l: 'monthly revenue (₦)', hv: 's', hj };
	return null;
};
