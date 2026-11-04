import type { MetadataRoute } from 'next';
import { getPages, siteOrigin } from '@/lib/cms';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const locales = await Promise.all(['ar', 'en'].map(async locale => ({ locale, pages: await getPages(locale) })));
  return locales.flatMap(({ locale, pages }) => pages.filter(page => !page.seo?.noindex).map(page => ({
    url: siteOrigin + (page.slug === 'home' ? '/' : '/' + page.slug) + (locale === 'en' ? '?lang=en' : ''),
    changeFrequency: 'weekly' as const, priority: page.slug === 'home' ? 1 : 0.7,
  })));
}
