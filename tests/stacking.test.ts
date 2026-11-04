import test from 'node:test';
import assert from 'node:assert/strict';
import { canStackCards, overlapProgress, stackOffset } from '../src/lib/stacking.ts';

test('overlap starts at the card edge and completes at the next sticky stop', () => {
  assert.equal(overlapProgress(518, 118, 400, 16), 0);
  assert.equal(overlapProgress(326, 118, 400, 16), 0.5);
  assert.equal(overlapProgress(134, 118, 400, 16), 1);
  assert.equal(overlapProgress(-1000, 118, 400, 16), 1);
  assert.equal(overlapProgress(2000, 118, 400, 16), 0);
});

test('oversized CMS content disables stacking rather than trapping unreadable text', () => {
  assert.equal(canStackCards([400, 420, 405, 400], 760, 118, 16, false), true);
  assert.equal(canStackCards([400, 900, 405, 400], 760, 118, 16, false), false);
  assert.equal(canStackCards([380, 380, 380, 380], 520, 94, 8, false), false);
  assert.equal(canStackCards([380, 380, 380, 380], 720, 94, 8, false), true);
  assert.equal(canStackCards([400, 400, 400, 400], 760, 118, 52, false), true);
  assert.equal(canStackCards([380, 380, 380, 380], 667, 94, 46, false), true);
});

test('reduced-motion, empty and single-card sections use ordinary document flow', () => {
  assert.equal(canStackCards([400, 400], 900, 118, 16, true), false);
  assert.equal(canStackCards([], 900, 118, 16, false), false);
  assert.equal(canStackCards([400], 900, 118, 16, false), false);
  assert.equal(canStackCards([0, 400], 900, 118, 16, false), false);
  assert.equal(canStackCards([400, Number.NaN], 900, 118, 16, false), false);
});

test('large dynamic lists cap their header offset instead of leaving the viewport', () => {
  assert.equal(stackOffset(0), 0);
  assert.equal(stackOffset(3), 3);
  assert.equal(stackOffset(99), 5);
  assert.equal(stackOffset(-1), 0);
  assert.equal(canStackCards(Array(100).fill(400), 760, 118, 16, false), true);
});
