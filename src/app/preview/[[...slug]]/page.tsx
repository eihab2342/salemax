import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSiteData } from '@/lib/cms';
import { pageMetadata } from '@/lib/metadata';
import { Website } from '@/components/website';

type Props = { params: Promise<{ slug?: string[] }>; searchParams: Promise<{ locale?: string; expires?: string; signature?: string }> };
async function load(props: Props) {
  const [{ slug = [] }, query] = await Promise.all([props.params, props.searchParams]);
  if (slug.length > 1 || !query.expires || !query.signature) notFound();
  return getSiteData(slug[0] || 'home', query.locale === 'en' ? 'en' : 'ar', query.expires, query.signature);
}
export async function generateMetadata(props: Props): Promise<Metadata> { return pageMetadata(await load(props)); }
export default async function Preview(props: Props) { return <Website site={await load(props)} />; }
