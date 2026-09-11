import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tag_list, people_match, people_visible, overlap, same_place, like_score } from './people.ts';

test('tag_list splits, slugs, dedupes, and caps', () => {
	assert.deepEqual(tag_list('Fintech, rust, raising'), ['fintech', 'rust', 'raising']);
	assert.deepEqual(tag_list('  AI tools , ai-tools, x '), ['ai-tools']);
	assert.equal(tag_list('a, b, ok').length, 1);
	assert.equal(tag_list(Array.from({ length: 20 }, (_, i) => `tag${i}`).join(',')).length, 12);
});

test('people_match is every word against handle name bio place tags and extra', () => {
	const p = {
		hn: 'ada',
		nm: 'Ada Lovelace',
		bo: 'builds payments',
		lc: 'abuja',
		tg: ['fintech'],
		extra: ['helpa', 'money & payments']
	};
	assert.equal(people_match('', p), true);
	assert.equal(people_match('ada', p), true);
	assert.equal(people_match('payments abuja', p), true);
	assert.equal(people_match('fintech', p), true);
	assert.equal(people_match('helpa', p), true);
	assert.equal(people_match('lagos', p), false);
	assert.equal(people_match('ada lagos', p), false);
});

test('people_visible hides an empty shell and keeps anyone with a name, bio, tag or product', () => {
	assert.equal(people_visible({ nm: '', bo: '', tg: [], n: 0 }), false);
	assert.equal(people_visible({ nm: 'Ada', bo: '', tg: [], n: 0 }), true);
	assert.equal(people_visible({ nm: '', bo: 'builds', tg: [], n: 0 }), true);
	assert.equal(people_visible({ nm: '', bo: '', tg: ['rust'], n: 0 }), true);
	assert.equal(people_visible({ nm: '', bo: '', tg: [], n: 1 }), true);
});

test('overlap is the shared tags, case-blind', () => {
	assert.deepEqual(overlap(['Fintech', 'rust'], ['fintech', 'go']), ['fintech']);
	assert.deepEqual(overlap([], ['a']), []);
});

test('same_place needs both sides and matches exactly after trim', () => {
	assert.equal(same_place('Abuja', 'abuja'), true);
	assert.equal(same_place('abuja', 'lagos'), false);
	assert.equal(same_place('', 'abuja'), false);
});

test('like_score rewards shared place, tags, then sectors', () => {
	const me = { lc: 'abuja', tg: ['fintech', 'rust'], cs: ['f', 'a'] };
	assert.equal(like_score(me, { lc: 'lagos', tg: [], cs: [] }), 0);
	assert.equal(like_score(me, { lc: 'abuja', tg: [], cs: [] }), 3);
	assert.equal(like_score(me, { lc: '', tg: ['fintech'], cs: [] }), 2);
	assert.equal(like_score(me, { lc: '', tg: [], cs: ['f', 'd'] }), 1);
	assert.equal(like_score(me, { lc: 'abuja', tg: ['rust', 'fintech'], cs: ['f'] }), 8);
});
