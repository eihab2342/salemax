'use client';

import { useEffect, useRef, useState } from 'react';
import type { Content, SiteContext } from '@/lib/types';
import { safeUrl, siteHref } from '@/lib/links';

export function ProjectShowcase({ content, context, enabled, mobile }: { content: Content; context: SiteContext; enabled: boolean; mobile: boolean }) {
  const items = (content.items || []).filter(item => { const url = safeUrl(item.image); return url && /^(https?:\/\/|\/)/i.test(url); });
  const viewport = useRef<HTMLDivElement>(null);
  const firstGroup = useRef<HTMLDivElement>(null);
  const interactionUntil = useRef(0);
  const scrollDrive = useRef(0);
  const touchStart = useRef({ x: 0, y: 0 });
  const [allowed, setAllowed] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [touching, setTouching] = useState(false);
  const [copies, setCopies] = useState(2);
  const en = context.locale === 'en';
  const running = allowed && !paused && !(content.pause_on_hover === true && hovering) && !focused && !touching;

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const small = window.matchMedia('(max-width: 767px)');
    const update = () => setAllowed(enabled && content.autoplay === true && items.length > 1 && !reduced.matches && (mobile || !small.matches));
    update(); reduced.addEventListener('change', update); small.addEventListener('change', update);
    return () => { reduced.removeEventListener('change', update); small.removeEventListener('change', update); };
  }, [enabled, content.autoplay, items.length, mobile]);

  useEffect(() => {
    const node = viewport.current, group = firstGroup.current;
    if (!node || !group || !running) return;
    let frame = 0, previous = 0, width = group.getBoundingClientRect().width;
    let position = node.scrollLeft, visible = true;
    const measure = () => { width = group.getBoundingClientRect().width; position = node.scrollLeft; if (width > 0) setCopies(Math.max(1, Math.ceil(node.clientWidth / width))); };
    const observer = new ResizeObserver(measure);
    observer.observe(group); observer.observe(node); measure();
    const intersection = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? true; previous = 0; });
    intersection.observe(node);
    const velocity = (content.speed === 'fast' ? 65 : content.speed === 'slow' ? 22 : 40) * (content.direction === 'right' ? -1 : 1);
    let lastScroll = window.scrollY;
    const scroll = () => {
      const distance = window.scrollY - lastScroll; lastScroll = window.scrollY;
      if (visible && content.scroll_reactive !== false && !document.hidden) scrollDrive.current = Math.max(-700, Math.min(700, scrollDrive.current + distance * .75));
    };
    window.addEventListener('scroll', scroll, { passive: true });
    const step = (time: number) => {
      const delta = previous ? Math.min(64, time - previous) : 0; previous = time;
      if (width > 0 && visible && !document.hidden && time > interactionUntil.current) {
        const pull = scrollDrive.current * (1 - Math.exp(-delta / 100));
        scrollDrive.current -= pull;
        position = ((position + velocity * delta / 1000 + pull * (velocity < 0 ? -1 : 1)) % width + width) % width;
        node.scrollLeft = position;
      } else position = node.scrollLeft;
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); intersection.disconnect(); window.removeEventListener('scroll', scroll); scrollDrive.current = 0; };
  }, [running, content.speed, content.direction, content.scroll_reactive, items.length]);

  if (!items.length) return context.preview ? <div className="container project-showcase-empty">{en ? 'Add project images from this section’s Content tab to display the slider.' : 'أضف صور المشاريع من تبويب المحتوى في هذا القسم لعرض السلايدر.'}</div> : null;
  const group = (duplicate: boolean, copy = 0) => <div className="project-showcase-group" key={duplicate ? `copy-${copy}` : 'original'} ref={duplicate ? undefined : firstGroup} aria-hidden={duplicate || undefined}>
    {items.map((item, index) => {
      const href = siteHref(item.url, context);
      const image = <img src={safeUrl(item.image)} alt={duplicate ? '' : item.alt || item.title || (en ? `Project ${index + 1}` : `مشروع ${index + 1}`)} loading="lazy" draggable={false} />;
      return <div className="project-showcase-card" dir={context.locale === 'ar' ? 'rtl' : 'ltr'} key={index}>
        {href ? <a href={href} tabIndex={duplicate ? -1 : undefined}>{image}</a> : image}
      </div>;
    })}
  </div>;
  return <div className="project-showcase" data-automatic={allowed} data-slide-width={content.slide_width || 'normal'} data-slide-ratio={content.slide_ratio || 'wide'} data-image-fit={content.image_fit || 'contain'}>
    <div className="project-showcase-window" ref={viewport} dir="ltr" role="region" aria-label={content.title || (en ? 'Our projects' : 'مشاريعنا')} tabIndex={0}
      onPointerEnter={event => { if (event.pointerType === 'mouse') setHovering(true); }} onPointerLeave={() => setHovering(false)}
      onFocusCapture={event => setFocused(event.target.matches(':focus-visible'))} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false); }}
      onKeyDown={() => setFocused(true)}
      onTouchStart={event => { touchStart.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }}
      onTouchMove={event => { const dx = Math.abs(event.touches[0].clientX - touchStart.current.x), dy = Math.abs(event.touches[0].clientY - touchStart.current.y); if (dx > 8 && dx > dy) setTouching(true); }}
      onTouchEnd={() => { if (touching) interactionUntil.current = performance.now() + 1500; setTouching(false); }} onTouchCancel={() => setTouching(false)}
      onWheel={event => { if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) interactionUntil.current = performance.now() + 1500; }}>
      <div className="project-showcase-track">{group(false)}{allowed && Array.from({ length: copies }, (_, index) => group(true, index))}</div>
    </div>
    {allowed && <div className="container project-showcase-controls"><button type="button" aria-pressed={paused} onClick={() => setPaused(!paused)}>{paused ? content.play_label || (en ? 'Play slider' : 'تشغيل السلايدر') : content.pause_label || (en ? 'Pause slider' : 'إيقاف السلايدر')}<span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span></button></div>}
  </div>;
}
