import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	momentum,
	by_momentum,
	headline,
	freshness,
	age_days,
	is_fresh,
	as_of,
	stage_label,
	raise_label,
	verify_label
} from './investor.ts';

const now = Date.UTC(2026, 7, 5);
const ago = (days: number) => String(Math.floor(now / 1000) - days * 86400);
const fresh = ago(10);
const mid = ago(120);
const old = ago(400);

test('age_days: counts whole days since the stamp', () => {
	assert.equal(age_days(ago(0), now), 0);
	assert.equal(age_days(ago(10), now), 10);
	assert.equal(age_days(ago(400), now), 400);
});

test('age_days: unusable stamps are null, not zero', () => {
	assert.equal(age_days(undefined, now), null);
	assert.equal(age_days('', now), null);
	assert.equal(age_days('yesterday', now), null);
	assert.equal(age_days('0', now), null);
	assert.equal(age_days('-5', now), null);
});

test('freshness: full weight for ninety days, half to a hundred and eighty, then nothing', () => {
	assert.equal(freshness(ago(0), now), 1);
	assert.equal(freshness(ago(90), now), 1);
	assert.equal(freshness(ago(91), now), 0.5);
	assert.equal(freshness(ago(180), now), 0.5);
	assert.equal(freshness(ago(181), now), 0);
	assert.equal(freshness(ago(400), now), 0);
});

test('freshness: an undated figure is treated as half-trusted, never full', () => {
	assert.equal(freshness(undefined, now), 0.5);
	assert.equal(freshness('', now), 0.5);
});

test('is_fresh: false only once a figure has fully decayed', () => {
	assert.equal(is_fresh({ hj: fresh }, now), true);
	assert.equal(is_fresh({ hj: mid }, now), true);
	assert.equal(is_fresh({ hj: old }, now), false);
	assert.equal(is_fresh({}, now), true);
});

test('as_of: renders a lowercase month and year, or says the date is missing', () => {
	assert.equal(as_of(String(Math.floor(Date.UTC(2026, 7, 5) / 1000))), 'as of august 2026');
	assert.equal(as_of(undefined), 'date not given');
	assert.equal(as_of('nonsense'), 'date not given');
});

test('momentum: empty payload scores zero', () => {
	assert.equal(momentum({}, now), 0);
});

test('momentum: status is checked by devcircles, so it never decays', () => {
	assert.equal(momentum({ r: 'l' }, now), 8);
	assert.equal(momentum({ r: 'l', hj: old }, now), 8);
	assert.equal(momentum({ r: 'p' }, now), 3);
	assert.equal(momentum({ r: 'u' }, now), 0);
	assert.equal(momentum({ r: 'zzz' }, now), 0);
});

test('momentum: builder-reported stage decays with its stamp', () => {
	assert.equal(momentum({ sg: 's', hj: fresh }, now), 20);
	assert.equal(momentum({ sg: 's', hj: mid }, now), 10);
	assert.equal(momentum({ sg: 's', hj: old }, now), 0);
	assert.equal(momentum({ sg: 's' }, now), 10);
	assert.equal(momentum({ sg: 'zzz', hj: fresh }, now), 0);
});

test('momentum: every stage rank, freshly stamped', () => {
	assert.equal(momentum({ sg: 'r', hj: fresh }, now), 16);
	assert.equal(momentum({ sg: 'l', hj: fresh }, now), 10);
	assert.equal(momentum({ sg: 'b', hj: fresh }, now), 5);
	assert.equal(momentum({ sg: 'i', hj: fresh }, now), 0);
});

test('momentum: revenue flag is worth twenty while it is current', () => {
	assert.equal(momentum({ m: 'y', hj: fresh }, now), 20);
	assert.equal(momentum({ m: 'y', hj: old }, now), 0);
	assert.equal(momentum({ m: 'n', hj: fresh }, now), 0);
});

test('momentum: users and revenue score on a log scale and are capped', () => {
	assert.equal(momentum({ q: '10', hj: fresh }, now), 5);
	assert.equal(momentum({ q: '1000', hj: fresh }, now), 15);
	assert.equal(momentum({ q: '10000', hj: fresh }, now), 20);
	assert.equal(momentum({ q: '100000000', hj: fresh }, now), 20);
	assert.equal(momentum({ a: '1000', hj: fresh }, now), 12);
	assert.equal(momentum({ a: '100000', hj: fresh }, now), 20);
	assert.equal(momentum({ a: '999999999', hj: fresh }, now), 20);
});

test('momentum: non-numeric, zero and negative figures score nothing', () => {
	assert.equal(momentum({ q: 'abc', hj: fresh }, now), 0);
	assert.equal(momentum({ q: '', hj: fresh }, now), 0);
	assert.equal(momentum({ q: '0', hj: fresh }, now), 0);
	assert.equal(momentum({ q: '-5', hj: fresh }, now), 0);
	assert.equal(momentum({ a: 'lots', hj: fresh }, now), 0);
});

test('momentum: headline metric and its verification', () => {
	assert.equal(momentum({ hm: '2000', hj: fresh }, now), 10);
	assert.equal(momentum({ hm: '2000', hv: 'v', hj: fresh }, now), 15);
	assert.equal(momentum({ hm: '2000', hv: 's', hj: fresh }, now), 10);
	assert.equal(momentum({ hv: 'v', hj: fresh }, now), 5);
});

test('momentum: a stale raise is worth nothing, because the round has probably closed', () => {
	assert.equal(momentum({ ra: 'y', hj: fresh }, now), 6);
	assert.equal(momentum({ ra: 'y', hj: old }, now), 0);
	assert.equal(momentum({ ra: 'n', hj: fresh }, now), 0);
});

test('momentum: everything at once, and the same payload as it ages', () => {
	const p = { hm: '2000', hv: 'v', m: 'y', a: '1000', q: '1000', sg: 'r', r: 'l', ra: 'y' };
	assert.equal(momentum({ ...p, hj: fresh }, now), 92);
	assert.equal(momentum({ ...p, hj: mid }, now), 50);
	assert.equal(momentum({ ...p, hj: old }, now), 8);
});

test('by_momentum: orders strongest first', () => {
	const weak = { n: 'weak', r: 'u' };
	const strong = { n: 'strong', r: 'l', m: 'y', hj: fresh };
	assert.deepEqual([weak, strong].sort((a, b) => by_momentum(a, b, now)), [strong, weak]);
});

test('by_momentum: a confirmed number outranks an identical stale one', () => {
	const stale = { n: 'stale', q: '5000', hj: old };
	const current = { n: 'current', q: '5000', hj: fresh };
	assert.deepEqual([stale, current].sort((a, b) => by_momentum(a, b, now)), [current, stale]);
});

test('by_momentum: equal scores fall back to name', () => {
	const b = { n: 'beta', r: 'l' };
	const a = { n: 'alpha', r: 'l' };
	assert.deepEqual([b, a].sort((x, y) => by_momentum(x, y, now)), [a, b]);
});

test('by_momentum: missing names do not throw', () => {
	assert.doesNotThrow(() => [{ r: 'l' }, { r: 'l' }].sort((a, b) => by_momentum(a, b, now)));
});

test('headline: prefers the explicit headline metric and carries its stamp', () => {
	assert.deepEqual(headline({ hm: '2000', hl: 'active users', hv: 'v', hj: fresh, k: 'other' }), {
		v: '2000',
		l: 'active users',
		hv: 'v',
		hj: fresh
	});
});

test('headline: explicit metric without a label or verification gets defaults', () => {
	assert.deepEqual(headline({ hm: '2000' }), {
		v: '2000',
		l: 'headline metric',
		hv: 's',
		hj: ''
	});
});

test('headline: falls back to proudest metric, then users, then revenue', () => {
	assert.deepEqual(headline({ k: 'first paying customer', hj: fresh }), {
		v: 'first paying customer',
		l: 'proudest metric',
		hv: 's',
		hj: fresh
	});
	assert.deepEqual(headline({ q: '2000' }), { v: '2000', l: 'users', hv: 's', hj: '' });
	assert.deepEqual(headline({ m: 'y', a: '450000' }), {
		v: '450000',
		l: 'monthly revenue (₦)',
		hv: 's',
		hj: ''
	});
});

test('headline: nothing to show returns null', () => {
	assert.equal(headline({}), null);
	assert.equal(headline({ n: 'name only', o: 'a one-liner' }), null);
	assert.equal(headline({ m: 'y' }), null);
});

test('labels cover every stored code and stay lowercase', () => {
	assert.deepEqual(Object.keys(stage_label).sort(), ['b', 'i', 'l', 'r', 's']);
	assert.deepEqual(Object.keys(raise_label).sort(), ['n', 'y']);
	assert.deepEqual(Object.keys(verify_label).sort(), ['s', 'v']);
	for (const v of Object.values(stage_label)) assert.equal(v, v.toLowerCase());
	for (const v of Object.values(raise_label)) assert.equal(v, v.toLowerCase());
	for (const v of Object.values(verify_label)) assert.equal(v, v.toLowerCase());
});
