import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	room_slug,
	room_ok,
	next_room,
	in_room,
	room_filter,
	room_one_filter,
	room_msg_filter,
	room_match,
	member_count,
	type Room
} from './room.ts';

const room = (o: Partial<Room> = {}): Room =>
	Object.assign(
		{
			hn: 'fintech',
			nm: 'fintech',
			ds: 'payments and rails',
			ow: 'ada@x.com',
			mb: ['ada@x.com', 'zed@x.com'],
			tg: ['payments'],
			mx: 'hello',
			md: 1000,
			j: 900
		},
		o
	);

test('room_slug and room_ok reuse the public handle rules', () => {
	assert.equal(room_slug('Fintech Club'), 'fintech-club');
	assert.equal(room_ok('fintech-club'), true);
	assert.equal(room_ok('x'), false);
});

test('next_room walks past taken handles', () => {
	assert.equal(next_room('fintech', ['fintech']), 'fintech-2');
});

test('in_room is case-blind on the email', () => {
	const r = room();
	assert.equal(in_room(r, 'ADA@x.com'), true);
	assert.equal(in_room(r, 'zed@x.com'), true);
	assert.equal(in_room(r, 'snoop@x.com'), false);
});

test('room_filter scopes to this tenant and room rows', () => {
	assert.deepEqual(room_filter().must, [
		{ key: 's', match: { value: 'adca' } },
		{ key: 't', match: { value: 'rm' } }
	]);
});

test('room_one_filter pins one handle', () => {
	assert.deepEqual(room_one_filter('fintech').must, [
		{ key: 's', match: { value: 'adca' } },
		{ key: 't', match: { value: 'rm' } },
		{ key: 'hn', match: { value: 'fintech' } }
	]);
});

test('room_msg_filter pins one room and optionally newer messages', () => {
	assert.deepEqual(room_msg_filter('fintech').must, [
		{ key: 's', match: { value: 'adca' } },
		{ key: 't', match: { value: 'rg' } },
		{ key: 'rh', match: { value: 'fintech' } }
	]);
	assert.deepEqual(room_msg_filter('fintech', 1700).must[3], { key: 'md', range: { gte: 1701 } });
	assert.equal(room_msg_filter('fintech', 0).must.length, 3);
});

test('room_match is every word against handle name description and tags', () => {
	const r = room();
	assert.equal(room_match('', r), true);
	assert.equal(room_match('payments', r), true);
	assert.equal(room_match('fintech rails', r), true);
	assert.equal(room_match('lagos', r), false);
});

test('member_count is the stored list length', () => {
	assert.equal(member_count(room()), 2);
	assert.equal(member_count(room({ mb: [] })), 0);
});
