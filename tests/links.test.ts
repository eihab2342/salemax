import test from 'node:test';
import assert from 'node:assert/strict';
import { safeUrl, siteHref, validColor } from '../src/lib/links.ts';

test('unsafe protocols, protocol-relative and backslash URLs are rejected', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,test', '//evil.example', '/\\evil.example', 'https://example.com\nfoo', 'vbscript:test']) assert.equal(safeUrl(url), undefined);
  assert.equal(safeUrl('/features#sales'), '/features#sales');
  assert.equal(safeUrl('https://example.com/path?q=test'), 'https://example.com/path?q=test');
  assert.equal(safeUrl('mailto:hello@example.com'), 'mailto:hello@example.com');
});
test('explicit preview navigation retains authorization and anchors', () => {
  const context = { locale: 'ar', preview: true, token: { expires: '999999', signature: 'signed' } };
  assert.equal(siteHref('/features#sales', context), '/preview/features?locale=ar&expires=999999&signature=signed#sales');
  assert.equal(siteHref('/', context), '/preview/home?locale=ar&expires=999999&signature=signed');
  assert.equal(siteHref('https://example.com', context), 'https://example.com');
});
test('development preview never inserts its server-only token into ordinary links', () => {
  assert.equal(siteHref('/features', { locale: 'ar', preview: true }), '/features');
  assert.equal(siteHref('/features', { locale: 'en', preview: false }), '/features?lang=en');
  assert.equal(siteHref('/demo?source=home#request', { locale: 'en', preview: false }), '/demo?source=home&lang=en#request');
});
test('style colors accept only six-digit hex values', () => {
  assert.equal(validColor('#f0643b'), '#f0643b');
  for (const value of ['red', '#fff', 'url(evil)', '#ffffff;display:none']) assert.equal(validColor(value), undefined);
});
