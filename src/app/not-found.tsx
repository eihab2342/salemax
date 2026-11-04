import Link from 'next/link';
import { headers } from 'next/headers';
export default async function NotFound() {
  const english = (await headers()).get('x-site-locale') === 'en';
  return <main className="system-page"><span className="system-number">404</span><h1>{english ? 'Page not found' : 'الصفحة غير موجودة'}</h1><p>{english ? 'This link is unavailable or the page has not been published yet.' : 'الرابط غير متاح أو الصفحة لم تُنشر بعد.'}</p><Link href={english ? '/?lang=en' : '/'} className="button button-primary">{english ? 'Back to home' : 'العودة للرئيسية'}</Link></main>;
}
