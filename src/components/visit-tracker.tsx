'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

let volatileId: string | undefined;
let lastVisit = { path: '', at: 0 };

/** Anonymous first-party page views. Analytics never block navigation or rendering. */
export function VisitTracker({ locale }: { locale: string }) {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname || pathname.startsWith('/preview') || ['localhost', '127.0.0.1'].includes(location.hostname)) return;
    if (navigator.doNotTrack === '1' || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return;
    if (lastVisit.path === pathname && Date.now() - lastVisit.at < 5000) return;
    const send = () => {
      if (document.visibilityState !== 'visible') return;
      lastVisit = { path: pathname, at: Date.now() };
      let visitor = volatileId ||= crypto.randomUUID();
      try {
        const existing = localStorage.getItem('salemax.anonymous-visitor');
        if (existing && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(existing)) visitor = existing;
        else localStorage.setItem('salemax.anonymous-visitor', visitor);
      } catch { /* Storage disabled: count this browser instance without persistence. */ }
      volatileId = visitor;
      const origin = (process.env.NEXT_PUBLIC_CMS_ORIGIN || 'https://mediumpurple-jay-763780.hostingersite.com').replace(/\/$/, '');
      void fetch(origin + '/api/v1/analytics/visit', {
        method: 'POST', mode: 'cors', credentials: 'omit', keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: crypto.randomUUID(), visitor_id: visitor, path: pathname, locale, referrer: document.referrer || null }),
      }).catch(() => {});
    };
    const timer = window.setTimeout(send, 400);
    return () => window.clearTimeout(timer);
  }, [pathname, locale]);
  return null;
}
