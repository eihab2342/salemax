'use client';

import { useEffect, useRef } from 'react';

/** Progressive enhancement only: all content is visible without JavaScript. */
export function ExperienceEffects() {
  const marker = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const site = marker.current?.closest<HTMLElement>('.website');
    if (!site) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const revealSelector = '.section-heading, .solution-card, .resource-card, .story-step, .logos-grid, .cta-box, .feature-card, .testimonials-grid figure, .team-grid article, .stats-row>div, .contact-form-wrap, .footer-main';
    const seen = new WeakSet<Element>();
    let observer: IntersectionObserver | undefined;
    let frame = 0, pointerFrame = 0, scanFrame = 0;
    let active: HTMLElement | null = null;
    let bounds: DOMRect | null = null;
    let pointerX = 0, pointerY = 0;
    const resetPointer = () => {
      active?.style.removeProperty('--motion-x'); active?.style.removeProperty('--motion-y');
      active?.style.removeProperty('--spot-x'); active?.style.removeProperty('--spot-y');
      active = null; bounds = null;
      cancelAnimationFrame(pointerFrame); pointerFrame = 0;
    };
    const updatePointer = () => {
      pointerFrame = 0;
      if (!active || !bounds) return;
      const x = Math.max(-1, Math.min(1, (pointerX - bounds.left) / Math.max(bounds.width, 1) * 2 - 1));
      const y = Math.max(-1, Math.min(1, (pointerY - bounds.top) / Math.max(bounds.height, 1) * 2 - 1));
      active.style.setProperty('--motion-x', String(x)); active.style.setProperty('--motion-y', String(y));
      active.style.setProperty('--spot-x', `${(x + 1) * 50}%`); active.style.setProperty('--spot-y', `${(y + 1) * 50}%`);
    };
    const move = (event: PointerEvent) => {
      if (motion.matches || !pointer.matches || event.pointerType === 'touch') return;
      const target = (event.target as Element).closest<HTMLElement>('.button, .solution-card, .feature-card, .price-card');
      if (target !== active) { resetPointer(); active = target; bounds = target?.getBoundingClientRect() || null; }
      if (!active) return;
      pointerX = event.clientX; pointerY = event.clientY;
      if (!pointerFrame) pointerFrame = requestAnimationFrame(updatePointer);
    };
    const draw = () => {
      frame = 0;
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      site.style.setProperty('--reading-progress', distance > 0 ? String(Math.min(1, Math.max(0, window.scrollY / distance))) : '0');
      site.dataset.scrolled = String(window.scrollY > 20);
      const hero = site.querySelector<HTMLElement>('.hero');
      if (hero && !motion.matches && pointer.matches) {
        site.style.setProperty('--hero-scroll', `${Math.min(26, Math.max(0, -hero.getBoundingClientRect().top * .055))}px`);
      } else site.style.removeProperty('--hero-scroll');
    };
    const scroll = () => { resetPointer(); if (!frame) frame = requestAnimationFrame(draw); };
    const scan = () => {
      scanFrame = 0;
      site.querySelectorAll<HTMLElement>(revealSelector).forEach(node => {
        if (seen.has(node)) return;
        seen.add(node);
        const siblings = node.parentElement ? Array.from(node.parentElement.children) : [];
        node.style.setProperty('--reveal-delay', `${Math.max(0, siblings.indexOf(node) % 4) * 65}ms`);
        node.classList.add('motion-reveal'); observer?.observe(node);
      });
    };
    const configure = () => {
      observer?.disconnect();
      resetPointer();
      site.dataset.motion = motion.matches ? 'reduced' : 'full';
      if (motion.matches || !('IntersectionObserver' in window)) return;
      observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        observer?.unobserve(entry.target);
      }), { threshold: 0.08, rootMargin: '0px 0px -25px 0px' });
      // Reattach existing nodes when a visitor changes their motion preference.
      site.querySelectorAll('.motion-reveal:not(.in-view)').forEach(node => observer?.observe(node));
      scan();
    };
    configure(); draw();
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', scroll);
    motion.addEventListener('change', configure);
    pointer.addEventListener('change', resetPointer);
    site.addEventListener('pointermove', move, { passive: true });
    site.addEventListener('pointerleave', resetPointer);
    site.addEventListener('pointercancel', resetPointer);
    const mutation = new MutationObserver(records => {
      records.forEach(record => record.removedNodes.forEach(node => {
        if (!(node instanceof Element)) return;
        observer?.unobserve(node);
        node.querySelectorAll('.motion-reveal').forEach(child => observer?.unobserve(child));
      }));
      if (motion.matches || scanFrame || !records.some(record => Array.from(record.addedNodes).some(node => node instanceof Element))) return;
      scanFrame = requestAnimationFrame(scan);
    });
    mutation.observe(site, { childList: true, subtree: true });
    const resize = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scroll) : undefined;
    resize?.observe(site);
    return () => {
      observer?.disconnect(); resize?.disconnect(); mutation.disconnect(); resetPointer(); cancelAnimationFrame(frame); cancelAnimationFrame(scanFrame);
      window.removeEventListener('scroll', scroll); window.removeEventListener('resize', scroll);
      motion.removeEventListener('change', configure);
      pointer.removeEventListener('change', resetPointer);
      site.removeEventListener('pointermove', move); site.removeEventListener('pointerleave', resetPointer); site.removeEventListener('pointercancel', resetPointer);
      delete site.dataset.scrolled;
      delete site.dataset.motion;
      site.querySelectorAll<HTMLElement>('.motion-reveal').forEach(node => { node.classList.remove('motion-reveal', 'in-view'); node.style.removeProperty('--reveal-delay'); });
      site.style.removeProperty('--reading-progress');
      site.style.removeProperty('--hero-scroll');
    };
  }, []);
  return <div ref={marker} className="reading-progress" aria-hidden="true" />;
}
