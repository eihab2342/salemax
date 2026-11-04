'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { canStackCards, overlapProgress, stackOffset } from '@/lib/stacking';

/** Native sticky positioning; JS adds depth and ensures oversized CMS content stays readable. */
export function StackingCards({ intro, children, count, animate = true, mobile = true }: { intro: ReactNode; children: ReactNode; count: number; animate?: boolean; mobile?: boolean }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    const deck = element?.querySelector<HTMLElement>('.feature-stack');
    if (!element || !deck) return;
    const cards = Array.from(deck.querySelectorAll<HTMLElement>(':scope > .stack-card'));
    const faces = cards.map(card => card.querySelector<HTMLElement>('.stack-card-face'));
    const links = Array.from(element.querySelectorAll<HTMLAnchorElement>('.stack-index a'));
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let enabled = false, nearby = true, frame = 0, measuring = 0;
    let base = 0, step = 0, active = -1;
    let offsets: number[] = [], heights: number[] = [], progress: number[] = [];

    const activate = (index: number) => {
      if (active === index) return;
      active = index;
      links.forEach((link, i) => {
        if (i === index) link.setAttribute('aria-current', 'step');
        else link.removeAttribute('aria-current');
      });
    };

    const draw = () => {
      frame = 0;
      if (!nearby || !enabled) return;
      const deckTop = deck.getBoundingClientRect().top;
      let current = 0;
      cards.forEach((card, index) => {
        const target = base + stackOffset(index) * step;
        if (deckTop + offsets[index] <= target + 24) current = index;
        const amount = index === cards.length - 1 ? 0 : overlapProgress(deckTop + offsets[index + 1], target, heights[index], step);
        if (Math.abs(amount - (progress[index] ?? -1)) > 0.002) {
          faces[index]?.style.setProperty('--stack-progress', amount.toFixed(4));
          progress[index] = amount;
        }
      });
      activate(current);
    };
    const schedule = () => { if (!frame && nearby && enabled) frame = requestAnimationFrame(draw); };

    const measure = () => {
      measuring = 0;
      const style = getComputedStyle(element);
      base = parseFloat(style.getPropertyValue('--stack-top')) || 116;
      step = parseFloat(style.getPropertyValue('--stack-step')) || 52;
      const gap = parseFloat(getComputedStyle(deck).rowGap) || 28;
      heights = cards.map(card => card.offsetHeight);
      let offset = 0;
      offsets = heights.map(height => { const position = offset; offset += height + gap; return position; });
      enabled = CSS.supports('position', 'sticky') && canStackCards(heights, window.innerHeight, base, step, motion.matches || !animate || (!mobile && window.innerWidth <= 767));
      element.dataset.stacking = enabled ? 'on' : 'off';
      if (!enabled) {
        faces.forEach(face => face?.style.removeProperty('--stack-progress'));
        progress = []; activate(0);
      } else draw();
    };
    const resize = () => { if (!measuring) measuring = requestAnimationFrame(measure); };

    const reveal = (index: number, smooth: boolean) => {
      if (!enabled) return false;
      const top = Math.max(0, window.scrollY + deck.getBoundingClientRect().top + offsets[index] - base - stackOffset(index) * step);
      window.scrollTo({ top, behavior: smooth && !motion.matches ? 'smooth' : 'instant' });
      return true;
    };
    const navigate = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element).closest<HTMLAnchorElement>('.stack-index a');
      const index = anchor ? links.indexOf(anchor) : -1;
      if (index >= 0 && reveal(index, true)) event.preventDefault();
    };
    const focus = (event: FocusEvent) => {
      const card = (event.target as Element).closest<HTMLElement>('.stack-card');
      const index = card ? cards.indexOf(card) : -1;
      // Tab must never land on a link obscured behind a later card.
      if (index >= 0 && (progress[index] || 0) > 0.08) reveal(index, false);
    };

    const sizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    cards.forEach(card => sizeObserver?.observe(card));
    sizeObserver?.observe(deck);
    const visibilityObserver = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(entries => {
      nearby = entries[0].isIntersecting; if (nearby) schedule();
    }, { rootMargin: '150px 0px' }) : null;
    visibilityObserver?.observe(element);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', resize, { passive: true });
    motion.addEventListener('change', resize);
    element.addEventListener('click', navigate);
    element.addEventListener('focusin', focus);
    measure();

    return () => {
      cancelAnimationFrame(frame); cancelAnimationFrame(measuring);
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', resize);
      motion.removeEventListener('change', resize);
      element.removeEventListener('click', navigate); element.removeEventListener('focusin', focus);
      sizeObserver?.disconnect(); visibilityObserver?.disconnect();
      faces.forEach(face => face?.style.removeProperty('--stack-progress'));
    };
  }, [count, animate, mobile]);

  return <div ref={root} className="stacked-features" data-stacking="off">
    <aside className="stack-intro">{intro}</aside>
    <div className="feature-stack">{children}</div>
  </div>;
}
