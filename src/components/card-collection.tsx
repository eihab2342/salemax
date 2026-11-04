'use client';

import { Children, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Section } from '@/lib/types';
import { StackingCards } from './stacking-cards';
import { Icon } from './icon';
import { stackOffset } from '@/lib/stacking';

export function CardCollection({ children, intro, settings, labels, animate, mobile, locale }: { children: ReactNode; intro: ReactNode; settings: NonNullable<Section['settings']>; labels: Record<string, string>; animate: boolean; mobile: boolean; locale: string }) {
  const cards = Children.toArray(children);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });
  const layout = settings.cards_layout || 'grid';
  useEffect(() => {
    const element = track.current;
    if (!element || layout !== 'carousel') return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const bounds = element.getBoundingClientRect();
      const rtl = getComputedStyle(element).direction === 'rtl';
      const distances = Array.from(element.children).map(node => { const rect = node.getBoundingClientRect(); return Math.abs(rtl ? rect.right - bounds.right : rect.left - bounds.left); });
      setActive(distances.indexOf(Math.min(...distances)));
      const first = element.firstElementChild?.getBoundingClientRect();
      const last = element.lastElementChild?.getBoundingClientRect();
      if (first && last) setEdges({ start: rtl ? first.right <= bounds.right + 2 : first.left >= bounds.left - 2, end: rtl ? last.left >= bounds.left - 2 : last.right <= bounds.right + 2 });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    element.addEventListener('scroll', schedule, { passive: true });
    const observer = new ResizeObserver(schedule); observer.observe(element);
    return () => { element.removeEventListener('scroll', schedule); observer.disconnect(); cancelAnimationFrame(frame); };
  }, [layout, cards.length]);
  const move = (index: number) => {
    const node = track.current?.children[Math.max(0, Math.min(cards.length - 1, index))];
    node?.scrollIntoView({ block: 'nearest', inline: 'start', behavior: animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'instant' });
  };
  if (layout === 'stacked') return <StackingCards intro={intro} count={cards.length} animate={animate} mobile={mobile}>{cards.map((card, index) => <article className="stack-card collection-stack-card" key={index} style={{ '--stack-offset': stackOffset(index), zIndex: index + 1 } as React.CSSProperties}><div className="stack-card-face">{card}</div></article>)}</StackingCards>;
  return <div className={`collection-composition heading-${settings.heading_position || 'top'}`}>
    <div className="collection-heading">{intro}</div>
    <div className="collection-content">
      <div ref={track} className={`collection-track layout-${layout}`} role={layout === 'carousel' ? 'region' : undefined} aria-label={layout === 'carousel' ? labels.slide_label || (locale === 'ar' ? 'الكروت' : 'Cards') : undefined} tabIndex={layout === 'carousel' ? 0 : undefined} onKeyDown={event => { if (event.target !== event.currentTarget || layout !== 'carousel') return; const rtl = locale === 'ar'; if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); move(event.key === 'Home' ? 0 : event.key === 'End' ? cards.length - 1 : active + ((event.key === 'ArrowRight') !== rtl ? 1 : -1)); } }}>
        {cards.map((card, index) => <article className="collection-cell" key={index}>{card}</article>)}
      </div>
      {layout === 'carousel' && cards.length > 1 && <div className="collection-controls">
        {settings.show_arrows !== false && <div className="collection-arrows"><button type="button" aria-label={labels.previous_slide || (locale === 'ar' ? 'السابق' : 'Previous')} disabled={edges.start} onClick={() => move(active - 1)}><Icon name="left" /></button><button type="button" aria-label={labels.next_slide || (locale === 'ar' ? 'التالي' : 'Next')} disabled={edges.end} onClick={() => move(active + 1)}><Icon name="left" /></button></div>}
        {settings.show_dots !== false && <div className="collection-dots">{cards.map((_, index) => <button type="button" key={index} aria-label={`${labels.slide_label || (locale === 'ar' ? 'كارت' : 'Card')} ${index + 1}`} aria-pressed={active === index} onClick={() => move(index)} />)}</div>}
      </div>}
    </div>
  </div>;
}
