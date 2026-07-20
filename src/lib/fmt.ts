export const fmt_num = (v: string | number | undefined): string => {
	const s = String(v ?? '');
	if (s === '' || !Number.isFinite(+s)) return s;
	return new Intl.NumberFormat('en-NG').format(+s);
};

export const fmt_date = (v: string | undefined): string => {
	if (!v) return '';
	const d = new Date(v);
	if (isNaN(+d)) return v;
	return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
};
