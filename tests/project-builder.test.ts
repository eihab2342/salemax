import test from 'node:test';
import assert from 'node:assert/strict';
import { projectBrief, projectContactHref, readProjectFeatures } from '../src/lib/project-builder.ts';

test('selected features reach the localized contact URL without losing its existing query or anchor', () => {
  const href = projectContactHref('/contact?source=home#request', ['Payments', 'CRM'], { locale: 'en', preview: false });
  const url = new URL(href, 'https://example.com');
  assert.equal(url.pathname, '/contact');
  assert.equal(url.searchParams.get('lang'), 'en');
  assert.equal(url.searchParams.get('source'), 'home');
  assert.equal(url.hash, '#request');
  assert.deepEqual(readProjectFeatures(url.searchParams.get('project_features')), ['Payments', 'CRM']);
  assert.equal(projectBrief(readProjectFeatures(url.searchParams.get('project_features')), 'en'), 'I would like to discuss a project with these features: Payments, CRM');
});

test('Arabic briefs preserve labels and preview links preserve their signed parameters', () => {
  const features = ['الدفع الإلكتروني', 'الحجوزات'];
  assert.equal(projectBrief(features, 'ar'), 'حابب أناقش مشروع بالخصائص دي: الدفع الإلكتروني، الحجوزات');
  const url = new URL(projectContactHref('/contact', features, { locale: 'ar', preview: true, token: { expires: '123', signature: 'signed' } }), 'https://example.com');
  assert.equal(url.pathname, '/preview/contact');
  assert.equal(url.searchParams.get('signature'), 'signed');
  assert.deepEqual(readProjectFeatures(url.searchParams.get('project_features')), features);
});

test('invalid or oversized URL payloads are ignored and external destinations fall back to contact', () => {
  for (const payload of ['not json', '{"name":"test"}', '[42]', '["text\\ncontrol"]', JSON.stringify(Array(17).fill('a')), JSON.stringify(['a'.repeat(101)])]) assert.deepEqual(readProjectFeatures(payload), []);
  assert.deepEqual(readProjectFeatures('["CRM","CRM"]'), ['CRM']);
  assert.equal(projectBrief([], 'en'), '');
  assert.equal(projectContactHref('https://external.example', [], { locale: 'ar', preview: false }), '/contact');
});
