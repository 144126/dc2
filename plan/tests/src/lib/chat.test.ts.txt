import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	norm,
	conv_id,
	preview,
	is_a,
	peer_of,
	unread_key,
	unread_of,
	in_conv,
	conv_filter,
	search_filter,
	thread_filter,
	type Conv
} from './chat.ts';

const conv = (o: Partial<Conv> = {}): Conv =>
	Object.assign(
		{
			cv: 'ada@x.com|zed@x.com',
			ma: 'ada@x.com',
			mb: 'zed@x.com',
			pg: 'helpa',
			pn: 'Helpa',
			mx: 'hello',
			md: 1000,
			ua: 0,
			ub: 0
		},
		o
	);

test('norm lowercases and trims', () => {
	assert.equal(norm('  ADA@X.com '), 'ada@x.com');
	assert.equal(norm('ada@x.com'), 'ada@x.com');
});

test('conv_id is the same string whichever side asks', () => {
	assert.equal(conv_id('zed@x.com', 'ada@x.com'), 'ada@x.com|zed@x.com');
	assert.equal(conv_id('ada@x.com', 'zed@x.com'), 'ada@x.com|zed@x.com');
	assert.equal(conv_id(' ZED@x.com ', 'Ada@X.com'), 'ada@x.com|zed@x.com');
});

test('conv_id sorts, so ma is always the lower side', () => {
	const [a, b] = conv_id('zed@x.com', 'ada@x.com').split('|');
	assert.ok(a < b);
});

test('preview collapses whitespace', () => {
	assert.equal(preview('  hello\n\n  there  '), 'hello there');
	assert.equal(preview('a\tb'), 'a b');
});

test('preview truncates past 160 characters and marks it', () => {
	const long = 'x'.repeat(400);
	const out = preview(long);
	assert.equal(out.length, 160);
	assert.ok(out.endsWith('…'));
});

test('preview leaves a 160 character string alone', () => {
	const exact = 'y'.repeat(160);
	assert.equal(preview(exact), exact);
});

test('is_a / peer_of pick the right side', () => {
	const c = conv();
	assert.equal(is_a(c, 'ada@x.com'), true);
	assert.equal(is_a(c, 'ZED@x.com'), false);
	assert.equal(peer_of(c, 'ada@x.com'), 'zed@x.com');
	assert.equal(peer_of(c, 'zed@x.com'), 'ada@x.com');
	assert.equal(peer_of(c, 'ADA@x.com'), 'zed@x.com');
});

test('unread_key and unread_of read the asking side only', () => {
	const c = conv({ ua: 3, ub: 7 });
	assert.equal(unread_key(c, 'ada@x.com'), 'ua');
	assert.equal(unread_key(c, 'zed@x.com'), 'ub');
	assert.equal(unread_of(c, 'ada@x.com'), 3);
	assert.equal(unread_of(c, 'zed@x.com'), 7);
});

test('unread_of treats a missing counter as zero', () => {
	const c = conv();
	delete (c as unknown as Record<string, unknown>).ua;
	assert.equal(unread_of(c, 'ada@x.com'), 0);
});

test('in_conv only admits the two participants', () => {
	const c = conv();
	assert.equal(in_conv(c, 'ada@x.com'), true);
	assert.equal(in_conv(c, 'ZED@x.com'), true);
	assert.equal(in_conv(c, 'snoop@x.com'), false);
});

test('conv_filter scopes to this tenant, conversation rows, and either side', () => {
	const flt = conv_filter('ADA@x.com');
	assert.deepEqual(flt.must, [
		{ key: 's', match: { value: 'adca' } },
		{ key: 't', match: { value: 'cv' } }
	]);
	assert.deepEqual(flt.should, [
		{ key: 'ma', match: { value: 'ada@x.com' } },
		{ key: 'mb', match: { value: 'ada@x.com' } }
	]);
});

test('search_filter full-text matches message text across every chat the user is in', () => {
	const flt = search_filter('ada@x.com', '  payment gateway  ');
	assert.deepEqual(flt.must, [
		{ key: 's', match: { value: 'adca' } },
		{ key: 't', match: { value: 'm' } },
		{ key: 'mx', match: { text: 'payment gateway' } }
	]);
	assert.deepEqual(flt.should, [
		{ key: 'mf', match: { value: 'ada@x.com' } },
		{ key: 'mt', match: { value: 'ada@x.com' } }
	]);
});

test('search_filter is not scoped to one conversation', () => {
	const flt = search_filter('ada@x.com', 'invoice');
	assert.equal(
		flt.must.some((c) => c.key === 'cv'),
		false
	);
});

test('thread_filter pins one conversation', () => {
	const flt = thread_filter('ada@x.com|zed@x.com');
	assert.deepEqual(flt.must, [
		{ key: 's', match: { value: 'adca' } },
		{ key: 't', match: { value: 'm' } },
		{ key: 'cv', match: { value: 'ada@x.com|zed@x.com' } }
	]);
	assert.equal(flt.should, undefined);
});

test('thread_filter with `after` asks only for strictly newer messages', () => {
	const flt = thread_filter('ada@x.com|zed@x.com', 1700);
	assert.deepEqual(flt.must[3], { key: 'md', range: { gte: 1701 } });
});

test('thread_filter ignores an `after` of 0 so a fresh poll gets everything', () => {
	assert.equal(thread_filter('a|b', 0).must.length, 3);
});
