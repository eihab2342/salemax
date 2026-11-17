import { siteHref } from './links.ts';
import type { SiteContext } from './types.ts';

export function readProjectFeatures(value: string | null): string[] {
  if (!value || value.length > 6000) return [];
  try {
    const items: unknown = JSON.parse(value);
    if (!Array.isArray(items) || items.length > 16 || !items.every(item => typeof item === 'string' && item.trim().length > 0 && item.length <= 100 && !/[\u0000-\u001f]/u.test(item))) return [];
    return [...new Set(items.map(item => item.trim()))];
  } catch { return []; }
}

export function projectBrief(features: string[], locale: string): string {
  const items = readProjectFeatures(JSON.stringify(features));
  return items.length ? (locale === 'en' ? 'I would like to discuss a project with these features: ' : 'حابب أناقش مشروع بالخصائص دي: ') + items.join(locale === 'en' ? ', ' : '، ') : '';
}

export function projectContactHref(url: string | null | undefined, features: string[], context: SiteContext): string {
  const target = url?.startsWith('/') && !url.startsWith('//') ? url : '/contact';
  const href = siteHref(target, context) || siteHref('/contact', context)!;
  const parsed = new URL(href, 'https://internal.invalid');
  const valid = readProjectFeatures(JSON.stringify(features.map(feature => feature.replace(/[\u0000-\u001f]/gu, ' ').trim().slice(0, 100))));
  if (valid.length) parsed.searchParams.set('project_features', JSON.stringify(valid));
  return parsed.pathname + parsed.search + parsed.hash;
}
