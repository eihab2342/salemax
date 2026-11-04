import 'server-only';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { FormData, PageData, PreviewBundle, PreviewToken, Settings, SiteData } from './types';

export const cmsOrigin = (process.env.CMS_ORIGIN || 'https://mediumpurple-jay-763780.hostingersite.com').replace(/\/$/, '');
export const siteOrigin = (process.env.SITE_ORIGIN || 'https://salemax-git-main-eihab2342-3039s-projects.vercel.app').replace(/\/$/, '');

async function request<T>(path: string): Promise<T | null> {
  const response = await fetch(cmsOrigin + path, { cache: 'no-store', headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(10000) });
  if (response.status === 404 || response.status === 403) return null;
  if (!response.ok) throw new Error('CMS request failed: ' + response.status);
  return (await response.json() as { data: T }).data;
}

export const getSettings = cache(async (locale: string) => await request<Settings>('/api/v1/settings/' + locale) || {});
export const getPages = cache(async (locale: string) => await request<PageData[]>('/api/v1/pages/' + locale) || []);
const getBundle = cache(async (locale: string, expires: string, signature: string) => {
  if (!/^\d{1,12}$/.test(expires) || !/^[a-f0-9]{64}$/.test(signature)) return null;
  return request<PreviewBundle>(`/api/v1/preview/${locale}?expires=${expires}&signature=${signature}`);
});

function developmentToken(locale: string): PreviewToken | undefined {
  if (process.env.NODE_ENV === 'production' || !process.env.CMS_PREVIEW_URL) return;
  try {
    const url = new URL(process.env.CMS_PREVIEW_URL);
    if (url.origin !== new URL(cmsOrigin).origin || url.pathname !== '/api/v1/preview/' + locale) return;
    const expires = url.searchParams.get('expires'); const signature = url.searchParams.get('signature');
    if (expires && signature) return { expires, signature };
  } catch { return; }
}

export const getSiteData = cache(async (slug: string, locale: string, expires?: string, signature?: string): Promise<SiteData> => {
  if (!['ar', 'en'].includes(locale) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) notFound();
  const explicit = expires && signature ? { expires, signature } : undefined;
  const token = explicit || developmentToken(locale);
  if (token) {
    const bundle = await getBundle(locale, token.expires, token.signature);
    if (!bundle) notFound();
    const page = bundle.pages.find(page => page.slug === slug);
    if (!page) notFound();
    // The development preview token stays on the server; explicit preview links retain it.
    return { page, settings: bundle.settings, forms: bundle.forms, context: { locale, preview: true, token: explicit } };
  }
  const [page, settings] = await Promise.all([request<PageData>(`/api/v1/pages/${locale}/${slug}`), getSettings(locale)]);
  if (!page) notFound();
  const slugs = [...new Set(page.sections.filter(s => s.type === 'form').map(s => s.content.form_slug).filter(Boolean))];
  const forms = await Promise.all(slugs.map(slug => request<FormData>(`/api/v1/forms/${locale}/${slug}`)));
  return { page, settings, forms: forms.filter((form): form is FormData => !!form), context: { locale, preview: false } };
});
