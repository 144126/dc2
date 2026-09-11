import { test } from 'node:test';
import assert from 'node:assert/strict';
import { label, href, at, type Who } from './who.ts';

const w = (o: Partial<Who> = {}): Who => Object.assign({ e: 'ada@x.com', hn: 'ada', nm: 'Ada' }, o);

test('label prefers name, then handle, then the email local part', () => {
	assert.equal(label(w(), 'ada@x.com'), 'Ada');
	assert.equal(label(w({ nm: '' }), 'ada@x.com'), 'ada');
	assert.equal(label(w({ nm: '', hn: '' }), 'ada@x.com'), 'ada');
	assert.equal(label(null, 'ada@x.com'), 'ada');
	assert.equal(label(undefined, 'not-an-email'), 'not-an-email');
});

test('href is the public profile when a handle exists', () => {
	assert.equal(href(w()), '/u/ada');
	assert.equal(href(w({ hn: '' })), '');
	assert.equal(href(null), '');
});

test('at is the @handle, or empty', () => {
	assert.equal(at(w()), '@ada');
	assert.equal(at(w({ hn: '' })), '');
	assert.equal(at(null), '');
});
