import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSiteData } from '@/lib/cms';
import { pageMetadata } from '@/lib/metadata';
import { Website } from '@/components/website';

type Props = { params: Promise<{ slug?: string[] }>; searchParams: Promise<{ lang?: string }> };
async function load(props: Props) {
  const [{ slug = [] }, query] = await Promise.all([props.params, props.searchParams]);
  if (slug.length > 1) notFound();
  return getSiteData(slug[0] || 'home', query.lang === 'en' ? 'en' : 'ar');
}
export async function generateMetadata(props: Props): Promise<Metadata> { return pageMetadata(await load(props)); }
export default async function Page(props: Props) { return <Website site={await load(props)} />; }
