export type Cond =
	| { key: string; match: { value: string | number } }
	| { key: string; match: { text: string } }
	| { key: string; range: { gte?: number; lte?: number } };

export type Filter = { must: Cond[]; should?: Cond[] };

export const eq = (key: string, value: string | number): Cond => ({ key, match: { value } });
export const txt = (key: string, text: string): Cond => ({ key, match: { text } });
export const rng = (key: string, gte?: number, lte?: number): Cond => ({
	key,
	range: { ...(gte === undefined ? {} : { gte }), ...(lte === undefined ? {} : { lte }) }
});
export const f = (...conds: Cond[]): Filter => ({ must: conds });
export const f_or = (musts: Cond[], any_of: Cond[]): Filter => ({ must: musts, should: any_of });
