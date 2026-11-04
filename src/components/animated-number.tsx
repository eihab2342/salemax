'use client';

import { useEffect, useRef } from 'react';
import { numericLabel } from '@/lib/motion';

export function AnimatedNumber({ value, locale, enabled, duration, mobile }: { value?: string | null; locale: string; enabled: boolean; duration: number; mobile: boolean }) {
  const node = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const target = node.current;
    const parsed = numericLabel(value || '');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const small = window.matchMedia('(max-width: 767px)');
    if (!target || !parsed || !enabled || reduced.matches || (!mobile && small.matches) || !('IntersectionObserver' in window)) return;
    let frame = 0;
    const restore = () => { cancelAnimationFrame(frame); target.textContent = value || ''; };
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      if (reduced.matches || (!mobile && small.matches)) { restore(); return; }
      const start = performance.now();
      const format = new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'ar-EG', { maximumFractionDigits: Math.min(6, parsed.decimals) });
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / Math.max(250, duration));
        target.textContent = parsed.prefix + format.format(parsed.value * (1 - (1 - progress) ** 3)) + parsed.suffix;
        if (progress < 1) frame = requestAnimationFrame(tick); else restore();
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: .6 });
    observer.observe(target);
    reduced.addEventListener('change', restore); small.addEventListener('change', restore);
    return () => { observer.disconnect(); restore(); reduced.removeEventListener('change', restore); small.removeEventListener('change', restore); };
  }, [value, locale, enabled, duration, mobile]);
  return <strong><span className="visually-hidden">{value}</span><span ref={node} aria-hidden="true">{value}</span></strong>;
}
