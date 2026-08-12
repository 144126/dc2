import { test } from 'node:test';
import assert from 'node:assert/strict';
import { split_list, action_links, number_cards, related } from './detail.ts';
import type { P } from './investor.ts';

const now = Date.UTC(2026, 7, 9);
const fresh = String(Math.floor(now / 1000));

const prod = (o: P = {}): P => Object.assign({ g: 'x', n: 'X', c: 'f', r: 'l', hj: fresh }, o);

test('split_list splits on commas and newlines and drops the empties', () => {
	assert.deepEqual(split_list('Rust, GraphQL\nReact ,, PostgreSQL'), [
		'Rust',
		'GraphQL',
		'React',
		'PostgreSQL'
	]);
});

test('split_list is empty for blank, missing or comma-only input', () => {
	assert.deepEqual(split_list(''), []);
	assert.deepEqual(split_list(undefined), []);
	assert.deepEqual(split_list('  '), []);
	assert.deepEqual(split_list(',,\n,'), []);
});

test('action_links puts the product link first and marks it primary', () => {
	const links = action_links(prod({ u: 'https://helpa.com', gh: 'https://github.com/a/b' }));
	assert.equal(links[0].href, 'https://helpa.com');
	assert.equal(links[0].primary, true);
	assert.equal(links[1].href, 'https://github.com/a/b');
	assert.equal(links[1].primary, false);
});

test('action_links omits a link the builder never gave', () => {
	assert.deepEqual(action_links(prod()), []);
	assert.equal(action_links(prod({ dk: 'https://docs.x' })).length, 1);
	assert.equal(action_links(prod({ dk: 'https://docs.x' }))[0].label, 'documentation');
});

test('action_links returns all three when all three are set', () => {
	const links = action_links(prod({ u: 'https://a', gh: 'https://b', dk: 'https://c' }));
	assert.deepEqual(
		links.map((l) => l.label),
		['visit the product', 'source code', 'documentation']
	);
});

test('number_cards drops every metric the builder left blank', () => {
	assert.deepEqual(number_cards(prod()), []);
});

test('number_cards labels revenue in words, not codes', () => {
	assert.equal(number_cards(prod({ m: 'n' }))[0].l, 'revenue');
	assert.equal(number_cards(prod({ m: 'n' }))[0].v, 'no');
	assert.equal(number_cards(prod({ m: 'y' }))[0].v, 'yes');
	assert.ok(number_cards(prod({ m: 'y', a: '1500000' }))[0].v.includes('1,500,000'));
});

test('number_cards formats a user count with separators', () => {
	const cards = number_cards(prod({ q: '2400' }));
	assert.equal(cards.length, 1);
	assert.equal(cards[0].v, '2,400');
	assert.equal(cards[0].l, 'users, signups or downloads');
});

test('number_cards keeps team size and proudest metric', () => {
	const cards = number_cards(prod({ z: '4', k: 'first paying customer' }));
	assert.deepEqual(
		cards.map((c) => c.l),
		['team size', 'proudest metric']
	);
});

test('number_cards gives every card an icon name', () => {
	const cards = number_cards(prod({ q: '10', z: '2', k: 'shipped' }));
	assert.equal(
		cards.every((c) => !!c.icon),
		true
	);
});

const world: P[] = [
	prod({ g: 'self', n: 'Self', c: 'f' }),
	prod({ g: 'strong_same', n: 'Strong Same', c: 'f', q: '1000' }),
	prod({ g: 'weak_same', n: 'Weak Same', c: 'f', q: '10' }),
	prod({ g: 'strong_other', n: 'Strong Other', c: 'm', q: '100000' }),
	prod({ g: 'weak_other', n: 'Weak Other', c: 'm', r: 'u' })
];

test('related never includes the product itself', () => {
	assert.equal(
		related(world, world[0], 4, now).some((p) => p.g === 'self'),
		false
	);
});

test('related puts same-sector products first, strongest first', () => {
	assert.deepEqual(
		related(world, world[0], 2, now).map((p) => p.g),
		['strong_same', 'weak_same']
	);
});

test('related tops up from other sectors rather than showing a lonely product nothing', () => {
	const lonely = prod({ g: 'lonely', n: 'Lonely', c: 'z' });
	const out = related([...world, lonely], lonely, 3, now);
	assert.equal(out.length, 3);
	assert.equal(
		out.some((p) => p.g === 'lonely'),
		false
	);
	assert.equal(out[0].g, 'strong_other');
});

test('related honours the count asked for', () => {
	assert.equal(related(world, world[0], 3, now).length, 3);
	assert.equal(related(world, world[0], 1, now).length, 1);
});

test('related on a one-product world is empty, not a crash', () => {
	assert.deepEqual(related([world[0]], world[0], 3, now), []);
});
