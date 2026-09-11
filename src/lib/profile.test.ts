import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	slug_handle,
	handle_ok,
	default_handle,
	next_handle,
	profile_stats,
	joined
} from './profile.ts';
import type { P } from './investor.ts';

const now = Date.UTC(2026, 7, 10);
const fresh = String(Math.floor(now / 1000));
const stale = String(Math.floor(now / 1000) - 400 * 86400);

const prod = (o: P = {}): P => Object.assign({ g: 'x', n: 'X', c: 'f', r: 'l' }, o);

test('slug_handle lowercases and hyphenates', () => {
	assert.equal(slug_handle('Gold Edward Hogan'), 'gold-edward-hogan');
	assert.equal(slug_handle('  Ada__Lovelace!! '), 'ada-lovelace');
});

test('slug_handle never starts or ends with a hyphen', () => {
	assert.equal(slug_handle('---ada---'), 'ada');
	assert.equal(slug_handle('!!!'), '');
});

test('slug_handle caps at 24 characters and does not leave a trailing hyphen', () => {
	const out = slug_handle('a'.repeat(40));
	assert.equal(out.length, 24);
	assert.equal(slug_handle('abcdefghijklmnopqrstuvw x').endsWith('-'), false);
});

test('handle_ok accepts a real handle', () => {
	assert.equal(handle_ok('gold-hogan'), true);
	assert.equal(handle_ok('ada2'), true);
	assert.equal(handle_ok('a'.repeat(24)), true);
});

test('handle_ok rejects anything that would break a url or look empty', () => {
	assert.equal(handle_ok(''), false);
	assert.equal(handle_ok('a'), false);
	assert.equal(handle_ok('-ada'), false);
	assert.equal(handle_ok('Ada'), false);
	assert.equal(handle_ok('ada lovelace'), false);
	assert.equal(handle_ok('ada/lovelace'), false);
	assert.equal(handle_ok('a'.repeat(25)), false);
});

test('default_handle comes from the email local part, without the plus tag', () => {
	assert.equal(default_handle('gold.hogan@gmail.com'), 'gold-hogan');
	assert.equal(default_handle('Gold.Hogan+dc2@gmail.com'), 'gold-hogan');
});

test('default_handle never returns an empty handle', () => {
	assert.equal(default_handle('!!!@gmail.com'), 'builder');
});

test('next_handle returns the wanted handle when it is free', () => {
	assert.equal(next_handle('ada', []), 'ada');
	assert.equal(next_handle('ada', ['bob']), 'ada');
});

test('next_handle walks past every taken handle', () => {
	assert.equal(next_handle('ada', ['ada']), 'ada-2');
	assert.equal(next_handle('ada', ['ada', 'ada-2', 'ada-3']), 'ada-4');
});

test('next_handle keeps the deduped handle inside the length limit', () => {
	const long = 'a'.repeat(24);
	const out = next_handle(long, [long]);
	assert.ok(out.length <= 24);
	assert.ok(handle_ok(out));
});

test('profile_stats counts products, live ones, and fresh raises', () => {
	const s = profile_stats(
		[
			prod({ r: 'l' }),
			prod({ r: 'p' }),
			prod({ r: 'l', ra: 'y', hj: fresh }),
			prod({ r: 'u', ra: 'y', hj: stale })
		],
		now
	);
	assert.deepEqual(s, { n: 4, live: 2, raising: 1 });
});

test('profile_stats on no products is all zeroes, not a crash', () => {
	assert.deepEqual(profile_stats([], now), { n: 0, live: 0, raising: 0 });
});

test('joined is the earliest product creation stamp', () => {
	assert.equal(joined([prod({ j: '300' }), prod({ j: '100' }), prod({ j: '200' })]), 100);
});

test('joined ignores missing or junk stamps', () => {
	assert.equal(joined([prod({ j: '' }), prod({ j: '500' })]), 500);
	assert.equal(joined([prod({ j: 'nope' })]), 0);
	assert.equal(joined([]), 0);
});
