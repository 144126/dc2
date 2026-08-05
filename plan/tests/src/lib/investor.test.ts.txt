import { test } from 'node:test';
import assert from 'node:assert/strict';
import { momentum, by_momentum, headline, stage_label, raise_label, verify_label } from './investor.ts';

test('momentum: empty payload scores zero', () => {
	assert.equal(momentum({}), 0);
});

test('momentum: status points', () => {
	assert.equal(momentum({ r: 'l' }), 8);
	assert.equal(momentum({ r: 'p' }), 3);
	assert.equal(momentum({ r: 'u' }), 0);
	assert.equal(momentum({ r: 'zzz' }), 0);
});

test('momentum: stage points', () => {
	assert.equal(momentum({ sg: 's' }), 20);
	assert.equal(momentum({ sg: 'r' }), 16);
	assert.equal(momentum({ sg: 'l' }), 10);
	assert.equal(momentum({ sg: 'b' }), 5);
	assert.equal(momentum({ sg: 'i' }), 0);
	assert.equal(momentum({ sg: 'zzz' }), 0);
});

test('momentum: revenue flag is worth twenty', () => {
	assert.equal(momentum({ m: 'y' }), 20);
	assert.equal(momentum({ m: 'n' }), 0);
});

test('momentum: users score on a log scale', () => {
	assert.equal(momentum({ q: '10' }), 5);
	assert.equal(momentum({ q: '1000' }), 15);
	assert.equal(momentum({ q: '10000' }), 20);
});

test('momentum: users score is capped at twenty', () => {
	assert.equal(momentum({ q: '100000000' }), 20);
});

test('momentum: revenue amount scores on a log scale and is capped', () => {
	assert.equal(momentum({ a: '1000' }), 12);
	assert.equal(momentum({ a: '100000' }), 20);
	assert.equal(momentum({ a: '999999999' }), 20);
});

test('momentum: non-numeric, zero and negative figures score nothing', () => {
	assert.equal(momentum({ q: 'abc' }), 0);
	assert.equal(momentum({ q: '' }), 0);
	assert.equal(momentum({ q: '0' }), 0);
	assert.equal(momentum({ q: '-5' }), 0);
	assert.equal(momentum({ a: 'lots' }), 0);
});

test('momentum: headline metric and its verification', () => {
	assert.equal(momentum({ hm: '2000' }), 10);
	assert.equal(momentum({ hm: '2000', hv: 'v' }), 15);
	assert.equal(momentum({ hm: '2000', hv: 's' }), 10);
	assert.equal(momentum({ hv: 'v' }), 5);
});

test('momentum: raising now', () => {
	assert.equal(momentum({ ra: 'y' }), 6);
	assert.equal(momentum({ ra: 'n' }), 0);
});

test('momentum: everything at once adds up', () => {
	assert.equal(
		momentum({ hm: '2000', hv: 'v', m: 'y', a: '1000', q: '1000', sg: 'r', r: 'l', ra: 'y' }),
		92
	);
});

test('by_momentum: orders strongest first', () => {
	const weak = { n: 'weak', r: 'u' };
	const strong = { n: 'strong', r: 'l', m: 'y' };
	assert.deepEqual([weak, strong].sort(by_momentum), [strong, weak]);
});

test('by_momentum: equal scores fall back to name', () => {
	const b = { n: 'beta', r: 'l' };
	const a = { n: 'alpha', r: 'l' };
	assert.deepEqual([b, a].sort(by_momentum), [a, b]);
});

test('by_momentum: missing names do not throw', () => {
	assert.doesNotThrow(() => [{ r: 'l' }, { r: 'l' }].sort(by_momentum));
});

test('headline: prefers the explicit headline metric', () => {
	assert.deepEqual(headline({ hm: '2000', hl: 'active users', hv: 'v', k: 'other', q: '5' }), {
		v: '2000',
		l: 'active users',
		hv: 'v'
	});
});

test('headline: explicit metric without a label or verification gets defaults', () => {
	assert.deepEqual(headline({ hm: '2000' }), {
		v: '2000',
		l: 'headline metric',
		hv: 's'
	});
});

test('headline: falls back to proudest metric, then users, then revenue', () => {
	assert.deepEqual(headline({ k: 'first paying customer' }), {
		v: 'first paying customer',
		l: 'proudest metric',
		hv: 's'
	});
	assert.deepEqual(headline({ q: '2000' }), { v: '2000', l: 'users', hv: 's' });
	assert.deepEqual(headline({ m: 'y', a: '450000' }), {
		v: '450000',
		l: 'monthly revenue (₦)',
		hv: 's'
	});
});

test('headline: nothing to show returns null', () => {
	assert.equal(headline({}), null);
	assert.equal(headline({ n: 'name only', o: 'a one-liner' }), null);
	assert.equal(headline({ m: 'y' }), null);
});

test('labels cover every stored code', () => {
	assert.deepEqual(Object.keys(stage_label).sort(), ['b', 'i', 'l', 'r', 's']);
	assert.deepEqual(Object.keys(raise_label).sort(), ['n', 'y']);
	assert.deepEqual(Object.keys(verify_label).sort(), ['s', 'v']);
	for (const v of Object.values(stage_label)) assert.equal(v, v.toLowerCase());
	for (const v of Object.values(raise_label)) assert.equal(v, v.toLowerCase());
	for (const v of Object.values(verify_label)) assert.equal(v, v.toLowerCase());
});
