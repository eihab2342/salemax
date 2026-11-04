import test from 'node:test';
import assert from 'node:assert/strict';
import { motionOptions, numericLabel, revealAnimation } from '../src/lib/motion.ts';

test('the master switch disables every effect without losing stored choices', () => {
  const settings = { enabled: false, hover: true, reveal: 'zoom' as const, duration: '1400' };
  const result = motionOptions(settings);
  for (const value of Object.values(result)) if (typeof value === 'boolean') assert.equal(value, false);
  assert.equal(result.reveal, 'zoom');
  assert.equal(motionOptions({ ...settings, enabled: true }).hover, true);
  assert.equal(motionOptions({ magnetic: false }).magnetic, false);
});
test('unknown motion values cannot become CSS names or unbounded durations', () => {
  assert.equal(motionOptions({ duration: '999999' }).duration, 700);
  assert.equal(revealAnimation('url(evil)'), undefined);
  assert.equal(revealAnimation('fade'), 'salemax-fade');
  assert.equal(revealAnimation('none'), 'none');
});
test('counters preserve Arabic digits, units and decimals and reject nonnumeric labels', () => {
  assert.deepEqual(numericLabel('١٢+'), { value: 12, prefix: '', suffix: '+', decimals: 0 });
  assert.deepEqual(numericLabel('98.5%'), { value: 98.5, prefix: '', suffix: '%', decimals: 1 });
  assert.deepEqual(numericLabel('1,200'), { value: 1200, prefix: '', suffix: '', decimals: 0 });
  assert.equal(numericLabel('12/03/24'), null);
  assert.equal(numericLabel('Growing together'), null);
});
