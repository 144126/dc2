import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify, country_name, state_name, place_line, country_label, state_label } from './places.ts';

test('slugify: collapses anything that is not a letter or digit', () => {
	assert.equal(slugify('Akwa Ibom'), 'akwa-ibom');
	assert.equal(slugify('  Cross River  '), 'cross-river');
	assert.equal(slugify('FCT (Abuja)'), 'fct-abuja');
	assert.equal(slugify('Greater Accra'), 'greater-accra');
	assert.equal(slugify(''), '');
	assert.equal(slugify('---'), '');
});

test('slugify: is idempotent', () => {
	assert.equal(slugify(slugify('Cross River')), slugify('Cross River'));
});

test('country_name: known code, unknown code, nothing at all', () => {
	assert.equal(country_name('ng'), 'nigeria');
	assert.equal(country_name('gh'), 'ghana');
	assert.equal(country_name('zz'), 'country not given');
	assert.equal(country_name(''), 'country not given');
	assert.equal(country_name(undefined), 'country not given');
});

test('state_name: curated label wins, otherwise the slug is prettified', () => {
	assert.equal(state_name('ng', 'fct'), 'fct (abuja)');
	assert.equal(state_name('ng', 'akwa-ibom'), 'akwa ibom');
	assert.equal(state_name('gh', 'greater-accra'), 'greater accra');
	assert.equal(state_name('zz', 'somewhere-else'), 'somewhere else');
});

test('state_name: no state is stated, not blank', () => {
	assert.equal(state_name('ng', ''), 'state not given');
	assert.equal(state_name('ng', undefined), 'state not given');
	assert.equal(state_name(undefined, undefined), 'state not given');
});

test('place_line: state and country together, country alone, or nothing', () => {
	assert.equal(place_line('ng', 'enugu'), 'enugu · nigeria');
	assert.equal(place_line('ng', 'fct'), 'fct (abuja) · nigeria');
	assert.equal(place_line('ng', ''), 'nigeria');
	assert.equal(place_line('', 'enugu'), '');
	assert.equal(place_line(undefined, undefined), '');
});

test('place_line: an unknown country code never renders as a bare code', () => {
	assert.equal(place_line('zz', ''), '');
	assert.equal(place_line('zz', 'anywhere'), 'anywhere · country not given');
});

test('nigeria carries all thirty-six states plus the fct', () => {
	assert.equal(Object.keys(state_label.ng).length, 37);
	assert.ok(state_label.ng.lagos);
	assert.ok(state_label.ng.fct);
});

test('every label is lowercase, and every state slug round-trips through slugify', () => {
	for (const v of Object.values(country_label)) assert.equal(v, v.toLowerCase());
	for (const [co, states] of Object.entries(state_label)) {
		assert.ok(country_label[co], `${co} has states but is not a known country`);
		for (const [slug, label] of Object.entries(states)) {
			assert.equal(label, label.toLowerCase());
			assert.equal(slug, slugify(slug), `${slug} is not a clean slug`);
		}
	}
});

test('country codes are two lowercase letters', () => {
	for (const co of Object.keys(country_label)) assert.match(co, /^[a-z]{2}$/);
});
