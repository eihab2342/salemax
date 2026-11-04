import { NextResponse, type NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  const locale = request.nextUrl.pathname.startsWith('/preview') ? request.nextUrl.searchParams.get('locale') : request.nextUrl.searchParams.get('lang');
  headers.set('x-site-locale', locale === 'en' ? 'en' : 'ar');
  return NextResponse.next({ request: { headers } });
}

export const config = { matcher: ['/((?!_next|api|brand|robots.txt|sitemap.xml|favicon.ico).*)'] };
