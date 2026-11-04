import type { SiteContext } from './types.ts';

export function safeUrl(value?: string | null): string | undefined {
  if (!value || /[\\\u0000-\u0020]/u.test(value)) return undefined;
  if (value.startsWith('/') && !value.startsWith('//')) return value;
  if (/^#[\p{L}\p{N}_-]+$/u.test(value)) return value;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(value)) {
    try {
      const url = new URL(value);
      if (['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)) return value;
    } catch { return undefined; }
  }
  return undefined;
}

export function siteHref(value: string | null | undefined, context: SiteContext): string | undefined {
  const safe = safeUrl(value);
  if (!safe || !safe.startsWith('/')) return safe;
  const url = new URL(safe, 'https://internal.invalid');
  if (context.preview && context.token) {
    const slug = url.pathname === '/' ? 'home' : url.pathname.slice(1);
    url.pathname = '/preview/' + slug;
    url.searchParams.set('locale', context.locale);
    url.searchParams.set('expires', context.token.expires);
    url.searchParams.set('signature', context.token.signature);
  } else if (context.locale !== 'ar') url.searchParams.set('lang', context.locale);
  return url.pathname + url.search + url.hash;
}

export function validColor(value?: string): string | undefined {
  return value && /^#[0-9a-f]{6}$/i.test(value) ? value : undefined;
}
