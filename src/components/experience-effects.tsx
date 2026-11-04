'use client';

import { useEffect, useRef } from 'react';

/** Progressive enhancement only: all content is visible without JavaScript. */
export function ExperienceEffects() {
  const marker = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const site = marker.current?.closest<HTMLElement>('.website');
    if (!site) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let observer: IntersectionObserver | undefined;
    let frame = 0;
    const draw = () => {
      frame = 0;
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      site.style.setProperty('--reading-progress', distance > 0 ? String(Math.min(1, Math.max(0, window.scrollY / distance))) : '0');
      site.dataset.scrolled = String(window.scrollY > 20);
    };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(draw); };
    const configure = () => {
      observer?.disconnect();
      site.querySelectorAll('.in-view').forEach(node => node.classList.remove('in-view'));
      if (motion.matches || !('IntersectionObserver' in window)) return;
      observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        observer?.unobserve(entry.target);
      }), { threshold: 0.12 });
      site.querySelectorAll('.section-heading, .solution-card, .resource-card, .story-step, .logos-grid, .cta-box').forEach(node => observer?.observe(node));
    };
    configure(); draw();
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', scroll);
    motion.addEventListener('change', configure);
    const resize = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scroll) : undefined;
    resize?.observe(site);
    return () => {
      observer?.disconnect(); resize?.disconnect(); cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scroll); window.removeEventListener('resize', scroll);
      motion.removeEventListener('change', configure);
      delete site.dataset.scrolled;
      site.style.removeProperty('--reading-progress');
    };
  }, []);
  return <div ref={marker} className="reading-progress" aria-hidden="true" />;
}
