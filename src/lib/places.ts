export const slugify = (s: string) =>
	s
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

export const country_label: Record<string, string> = {
	ng: 'nigeria',
	gh: 'ghana',
	ke: 'kenya',
	za: 'south africa',
	eg: 'egypt',
	et: 'ethiopia',
	tz: 'tanzania',
	ug: 'uganda',
	rw: 'rwanda',
	sn: 'senegal',
	ci: "côte d'ivoire",
	cm: 'cameroon',
	ma: 'morocco',
	tn: 'tunisia',
	dz: 'algeria',
	ao: 'angola',
	bj: 'benin',
	bw: 'botswana',
	bf: 'burkina faso',
	bi: 'burundi',
	cv: 'cabo verde',
	cf: 'central african republic',
	td: 'chad',
	km: 'comoros',
	cg: 'congo',
	cd: 'dr congo',
	dj: 'djibouti',
	gq: 'equatorial guinea',
	er: 'eritrea',
	sz: 'eswatini',
	ga: 'gabon',
	gm: 'gambia',
	gn: 'guinea',
	gw: 'guinea-bissau',
	ls: 'lesotho',
	lr: 'liberia',
	ly: 'libya',
	mg: 'madagascar',
	mw: 'malawi',
	ml: 'mali',
	mr: 'mauritania',
	mu: 'mauritius',
	mz: 'mozambique',
	na: 'namibia',
	ne: 'niger',
	st: 'são tomé and príncipe',
	sc: 'seychelles',
	sl: 'sierra leone',
	so: 'somalia',
	ss: 'south sudan',
	sd: 'sudan',
	tg: 'togo',
	zm: 'zambia',
	zw: 'zimbabwe',
	gb: 'united kingdom',
	us: 'united states',
	ca: 'canada',
	de: 'germany',
	fr: 'france',
	nl: 'netherlands',
	ae: 'united arab emirates'
};

export const state_label: Record<string, Record<string, string>> = {
	ng: {
		abia: 'abia',
		adamawa: 'adamawa',
		'akwa-ibom': 'akwa ibom',
		anambra: 'anambra',
		bauchi: 'bauchi',
		bayelsa: 'bayelsa',
		benue: 'benue',
		borno: 'borno',
		'cross-river': 'cross river',
		delta: 'delta',
		ebonyi: 'ebonyi',
		edo: 'edo',
		ekiti: 'ekiti',
		enugu: 'enugu',
		fct: 'fct (abuja)',
		gombe: 'gombe',
		imo: 'imo',
		jigawa: 'jigawa',
		kaduna: 'kaduna',
		kano: 'kano',
		katsina: 'katsina',
		kebbi: 'kebbi',
		kogi: 'kogi',
		kwara: 'kwara',
		lagos: 'lagos',
		nasarawa: 'nasarawa',
		niger: 'niger',
		ogun: 'ogun',
		ondo: 'ondo',
		osun: 'osun',
		oyo: 'oyo',
		plateau: 'plateau',
		rivers: 'rivers',
		sokoto: 'sokoto',
		taraba: 'taraba',
		yobe: 'yobe',
		zamfara: 'zamfara'
	}
};

export const country_name = (co: string | undefined): string =>
	(co && country_label[co]) || 'country not given';

export const state_name = (co: string | undefined, st: string | undefined): string => {
	if (!st) return 'state not given';
	return state_label[co ?? '']?.[st] ?? st.replace(/-/g, ' ');
};

export const place_line = (co: string | undefined, st: string | undefined): string => {
	if (!co) return '';
	if (!st) return country_label[co] ?? '';
	return `${state_name(co, st)} · ${country_name(co)}`;
};
