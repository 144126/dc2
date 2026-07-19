export const sector_order = ['f', 'm', 'a', 'b', 'd', 'z', 'e', 'v', 'y'] as const;

export const sector_info: Record<string, { n: string; i: string }> = {
	f: {
		n: 'money & payments',
		i: 'products that move, hold, and track money: the hardest problems to earn trust in, and the largest markets once you do.'
	},
	m: {
		n: 'marketplaces & commerce',
		i: 'platforms that connect buyers with sellers, renters with homes, and customers with skilled hands.'
	},
	a: {
		n: 'ai & data',
		i: 'tools that listen, summarize, and open up data. each one is built for a gap the global platforms overlook.'
	},
	b: {
		n: 'software for businesses',
		i: "software that runs someone's livelihood: a tailoring shop, a medical practice, a freelance career."
	},
	d: {
		n: 'developer tools',
		i: 'products built by developers, for developers: the picks and shovels of the software economy.'
	},
	z: {
		n: 'social & events',
		i: 'places where people gather: to talk, to ask, to celebrate, and to be heard.'
	},
	e: {
		n: 'learning & education',
		i: 'products that help people gain skills and make smarter decisions about their education.'
	},
	v: {
		n: 'studios & service firms',
		i: 'established firms inside the community: they generate revenue today and often fund the products of tomorrow.'
	},
	y: {
		n: 'early & in preview',
		i: 'builds that exist but are not ready to present themselves. every mature product on the previous pages once looked like this.'
	}
};

export const status_label: Record<string, string> = { l: 'live', p: 'preview', u: 'unverified' };

export const sector_color: Record<string, string> = {
	f: 'bg-coral',
	m: 'bg-ochre',
	a: 'bg-teal-brand',
	b: 'bg-plum',
	d: 'bg-cobalt',
	z: 'bg-coral',
	e: 'bg-ochre',
	v: 'bg-teal-brand',
	y: 'bg-plum'
};
