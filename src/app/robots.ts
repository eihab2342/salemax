import type { MetadataRoute } from 'next';
import { siteOrigin } from '@/lib/cms';
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/', disallow: ['/preview/', '/api/'] }, sitemap: siteOrigin + '/sitemap.xml' };
}
