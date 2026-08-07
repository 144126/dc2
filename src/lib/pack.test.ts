import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pack, radius_for, view_box } from './pack.ts';

const overlaps = (discs: { x: number; y: number; r: number }[], gap: number) => {
	for (let i = 0; i < discs.length; i++)
		for (let j = i + 1; j < discs.length; j++) {
			const a = discs[i];
			const b = discs[j];
			if (Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r + gap - 0.01) return `${i}/${j}`;
		}
	return '';
};

test('radius_for: area is proportional to count, not radius', () => {
	const one = radius_for(1);
	const four = radius_for(4);
	assert.equal(four / one, 2);
	assert.equal(Math.PI * four ** 2 / (Math.PI * one ** 2), 4);
});

test('radius_for: nothing is a zero disc, negatives do not go imaginary', () => {
	assert.equal(radius_for(0), 0);
	assert.equal(radius_for(-3), 0);
	assert.ok(Number.isFinite(radius_for(-3)));
});

test('pack: places every disc it is given', () => {
	assert.equal(pack([10, 8, 6, 4]).length, 4);
	assert.equal(pack([]).length, 0);
	assert.deepEqual(pack([12]), [{ x: 0, y: 0, r: 12 }]);
});

test('pack: no two discs ever overlap', () => {
	for (const radii of [
		[20, 14, 12, 9, 9, 7, 5, 5, 5, 5, 5, 5],
		[30, 5, 5, 5, 5, 5],
		[8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8]
	])
		assert.equal(overlaps(pack(radii, 6), 6), '', `overlap with ${radii.length} discs`);
});

test('pack: honours the gap it is given', () => {
	assert.equal(overlaps(pack([15, 12, 10, 8], 20), 20), '');
});

test('pack: the largest disc anchors the centre', () => {
	const [first] = pack([20, 10, 10]);
	assert.deepEqual(first, { x: 0, y: 0, r: 20 });
});

test('pack: is deterministic — same input, same layout', () => {
	const radii = [18, 13, 11, 9, 7, 7, 5];
	assert.deepEqual(pack(radii), pack(radii));
});

test('pack: stays compact rather than drifting into a line', () => {
	const discs = pack([12, 12, 12, 12, 12, 12, 12]);
	const spread = Math.max(...discs.map((d) => Math.hypot(d.x, d.y)));
	assert.ok(spread < 12 * 6, `cluster drifted to ${spread.toFixed(1)}`);
});

test('view_box: wraps every disc with padding', () => {
	const box = view_box([{ x: 0, y: 0, r: 10 }], 5);
	assert.equal(box, '-15 -15 30 30');
});

test('view_box: survives an empty field', () => {
	assert.equal(view_box([]), '0 0 1 1');
});
