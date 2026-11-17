'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, Plus, ArrowUpRight, X, Layers3 } from 'lucide-react';
import type { Content, FormData, SiteContext } from '@/lib/types';
import { projectContactHref } from '@/lib/project-builder';
import { SectionHeading } from './ui';
import { Icon } from './icon';
import { ContactForm } from './contact-form';

type Connection = { index: number; d: string };

export function ProjectBuilder({ content, context, enabled, mobile, form, labels }: { content: Content; context: SiteContext; enabled: boolean; mobile: boolean; form?: FormData; labels: Record<string, string> }) {
  const items = (content.items || []).filter(item => item.title).slice(0, 16);
  const [selected, setSelected] = useState<number[]>([]);
  const [inspected, setInspected] = useState(0);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [size, setSize] = useState({ width: 1, height: 1 });
  const [small, setSmall] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const map = useRef<HTMLDivElement>(null);
  const hub = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLButtonElement | null)[]>([]);
  const reduced = useReducedMotion();
  const detailId = useId();
  const dialogTitle = useId();
  const animated = enabled && !reduced && (mobile || !small);
  const detail = items[Math.min(inspected, Math.max(0, items.length - 1))];
  const choices = selected.filter(index => items[index]).map(index => items[index].title!);
  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (formOpen) node.showModal(); else if (node.open) node.close();
    if (!formOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [formOpen]);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => setSmall(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const container = map.current, center = hub.current;
    if (!container || !center) return;
    const measure = () => {
      const bounds = container.getBoundingClientRect(), core = center.getBoundingClientRect();
      const x = core.left + core.width / 2 - bounds.left, y = core.top + core.height / 2 - bounds.top;
      setSize({ width: bounds.width, height: bounds.height });
      setConnections(nodes.current.slice(0, items.length).flatMap((node, index) => {
        if (!node) return [];
        const box = node.getBoundingClientRect(), nx = box.left + box.width / 2 - bounds.left, ny = box.top + box.height / 2 - bounds.top;
        return [{ index, d: `M ${x} ${y} C ${(x + nx) / 2} ${y}, ${(x + nx) / 2} ${ny}, ${nx} ${ny}` }];
      }));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(container); observer.observe(center);
    nodes.current.forEach(node => { if (node) observer.observe(node); });
    measure();
    return () => observer.disconnect();
  }, [items.length, context.locale]);
  const toggle = (index: number) => { setInspected(index); setSelected(current => current.includes(index) ? current.filter(value => value !== index) : [...current, index]); };
  if (!items.length) return null;
  return <div className="project-builder">
    <SectionHeading content={content} />
    <div className="builder-workspace">
      <div className="builder-map" ref={map} style={{ '--builder-rows': Math.ceil(items.length / 2) } as CSSProperties}>
        <svg className="builder-connections" viewBox={`0 0 ${size.width} ${size.height}`} preserveAspectRatio="none" aria-hidden="true">
          {connections.map(connection => <path key={`base-${connection.index}`} d={connection.d} className="builder-connection-base" />)}
          <AnimatePresence>{connections.filter(connection => selected.includes(connection.index)).map(connection => <motion.path key={connection.index} d={connection.d} className="builder-connection-active" initial={animated ? { pathLength: 0, opacity: 0 } : false} animate={{ pathLength: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: animated ? .5 : 0 }} />)}</AnimatePresence>
        </svg>
        <div className="builder-hub" ref={hub}><span className="builder-hub-icon"><Layers3 strokeWidth={1.3} aria-hidden="true" /></span><strong>{content.hub_label}</strong><span className="builder-hub-count" aria-live="polite" aria-atomic="true">{choices.length} / {items.length}</span></div>
        {items.map((item, index) => <button key={index} ref={node => { nodes.current[index] = node; }} type="button" className="builder-node" aria-pressed={selected.includes(index)} aria-describedby={detailId} style={{ gridColumn: index % 2 ? 3 : 1, gridRow: Math.floor(index / 2) + 1 }} onClick={() => toggle(index)} onFocus={() => setInspected(index)} onPointerEnter={event => { if (event.pointerType === 'mouse') setInspected(index); }}>
          <span className="builder-node-icon"><Icon name={item.icon || 'layers'} size={23} /></span><strong>{item.title}</strong><span className="builder-node-toggle">{selected.includes(index) ? <Check size={13} aria-hidden="true" /> : <Plus size={13} aria-hidden="true" />}</span>
        </button>)}
      </div>
      <div className="builder-detail" id={detailId}>
        <AnimatePresence mode="wait" initial={false}><motion.div key={inspected} initial={animated ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: animated ? .18 : 0 }}><span><Icon name={detail?.icon} size={20} /></span><div><h3>{detail?.title}</h3><p>{detail?.description}</p></div></motion.div></AnimatePresence>
      </div>
      <div className="builder-summary">
        <div><span className="builder-summary-label">{content.selection_label}</span><div className="builder-selected">{choices.length ? selected.filter(index => items[index]).map(index => <button type="button" key={index} onClick={() => toggle(index)} aria-label={`${context.locale === 'en' ? 'Remove' : 'إزالة'} ${items[index].title}`}>{items[index].title}<X size={13} aria-hidden="true" /></button>) : <p>{content.empty_label}</p>}</div></div>
        {form ? <button type="button" className="button button-primary builder-cta" onClick={() => setFormOpen(true)}><span>{content.cta_label}</span><ArrowUpRight size={18} aria-hidden="true" /></button> : <Link href={projectContactHref(content.cta_url, choices, context)} className="button button-primary builder-cta"><span>{content.cta_label}</span><ArrowUpRight size={18} aria-hidden="true" /></Link>}
      </div>
    </div>
    {content.disclaimer && <p className="builder-disclaimer">{content.disclaimer}</p>}
    {form && <dialog ref={dialog} className="builder-inquiry-dialog" aria-labelledby={dialogTitle} onClose={() => setFormOpen(false)} onCancel={() => setFormOpen(false)} onClick={event => { if (event.target !== event.currentTarget) return; const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) setFormOpen(false); }}>
      <div className="builder-inquiry-heading"><div><span>{content.hub_label}</span><h2 id={dialogTitle}>{content.cta_label}</h2></div><button type="button" onClick={() => setFormOpen(false)} aria-label={context.locale === 'en' ? 'Close inquiry' : 'إغلاق النموذج'}><X size={21} aria-hidden="true" /></button></div>
      {formOpen && <ContactForm form={form} labels={labels} preview={context.preview} projectFeatures={choices} configurationLabel={content.selection_label} />}
    </dialog>}
  </div>;
}
