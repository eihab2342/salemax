import type { Metadata } from 'next';
import type { SiteData } from './types';
import { siteOrigin } from './cms';
import { safeUrl } from './links';

export function pageMetadata(site: SiteData): Metadata {
  const path = site.page.slug === 'home' ? '/' : '/' + site.page.slug;
  const image = safeUrl(site.page.seo?.image);
  const title = site.page.seo?.title || site.page.title;
  const description = site.page.seo?.description;
  return {
    title, description, metadataBase: new URL(siteOrigin),
    alternates: { canonical: path + (site.context.locale === 'en' ? '?lang=en' : ''), languages: { ar: path, en: path + '?lang=en', 'x-default': path } },
    robots: site.context.preview || site.page.seo?.noindex ? { index: false, follow: false } : { index: true, follow: true },
    icons: site.settings.brand?.favicon ? { icon: site.settings.brand.favicon } : undefined,
    openGraph: { title, description, type: 'website', locale: site.context.locale === 'ar' ? 'ar_EG' : 'en_US', siteName: site.settings.brand?.name, images: image ? [image] : undefined },
    twitter: { card: 'summary_large_image', title, description, images: image ? [image] : undefined },
  };
}
