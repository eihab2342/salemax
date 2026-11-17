'use client';

import { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, ArrowUpRight, Lightbulb, PenTool, Code2, Rocket } from 'lucide-react';
import type { Content, SiteContext } from '@/lib/types';
import { safeUrl } from '@/lib/links';
import { Buttons, SectionHeading } from './ui';

const stageIcons = [Lightbulb, PenTool, Code2, Rocket];

export function ProjectJourney({ content, context, enabled, mobile }: { content: Content; context: SiteContext; enabled: boolean; mobile: boolean }) {
  const [selected, setSelected] = useState(0);
  const [small, setSmall] = useState(false);
  const reduced = useReducedMotion();
  const id = useId();
  const items = content.items || [];
  const index = Math.min(selected, Math.max(0, items.length - 1));
  const item = items[index];
  const activeMotion = enabled && !reduced && (mobile || !small);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => setSmall(media.matches);
    update(); media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  if (!item) return null;
  const StageIcon = stageIcons[index % stageIcons.length];
  const src = safeUrl(item.image);
  const image = src && /^(https?:\/\/|\/)/i.test(src) ? src : undefined;
  return <div className="journey">
    <SectionHeading content={content} />
    <motion.div className="journey-layout" initial={false} whileInView={activeMotion ? { opacity: [0.65, 1], y: [28, 0] } : undefined} viewport={{ once: true, amount: .15 }} transition={{ duration: .65, ease: 'easeOut' }}>
      <div className="journey-steps" role="tablist" aria-label={content.title || undefined}>
        {items.map((step, i) => <button key={i} type="button" role="tab" id={`${id}-tab-${i}`} aria-controls={`${id}-panel`} aria-selected={index === i} tabIndex={index === i ? 0 : -1}
          onClick={() => setSelected(i)} onKeyDown={event => {
            const direction = context.locale === 'ar' ? -1 : 1;
            const delta = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : event.key === 'ArrowRight' ? direction : event.key === 'ArrowLeft' ? -direction : 0;
            const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : delta ? (i + delta + items.length) % items.length : null;
            if (next !== null) { event.preventDefault(); setSelected(next); document.getElementById(`${id}-tab-${next}`)?.focus(); }
          }}>
          <span className="journey-step-number">{String(i + 1).padStart(2, '0')}</span>
          <span><strong>{step.title}</strong>{step.category && <small>{step.category}</small>}</span>
          <ArrowUpRight className="journey-step-arrow" size={19} aria-hidden="true" />
        </button>)}
      </div>
      <div className="journey-panel" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${index}`} tabIndex={0}>
        <div className="journey-canvas" data-stage={index % 4}>
          <div className="journey-grid" aria-hidden="true" />
          <div className="journey-canvas-top"><span><i />{content.preview_title}</span><span dir="ltr">{String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span></div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div className="journey-scene" key={index} initial={activeMotion ? { opacity: 0, y: 22, scale: .97 } : false} animate={{ opacity: 1, y: 0, scale: 1 }} exit={activeMotion ? { opacity: 0, y: -12, scale: .98 } : { opacity: 0 }} transition={{ duration: activeMotion ? .32 : 0 }}>
              {image ? <img className="journey-custom-image" src={image} alt={item.alt || item.title || ''} loading="lazy" /> : <div className="journey-device" aria-hidden="true">
                <div className="journey-device-toolbar"><span /><span /><span /><i /></div>
                <div className="journey-device-body">
                  <div className="journey-device-heading"><span className="journey-scene-icon"><StageIcon size={32} strokeWidth={1.5} /></span><span><small>{item.tag}</small><strong>{item.title}</strong></span></div>
                  {index % 4 === 0 ? <div className="journey-mindmap"><span /><span /><span /><div><Lightbulb size={31} /></div></div>
                    : index % 4 === 1 ? <div className="journey-wireframe"><div><i /><i /><i /><b /></div><aside><i /><i /><i /></aside></div>
                    : index % 4 === 2 ? <div className="journey-code" dir="ltr"><span>&lt;your_idea&gt;</span><i /><i /><i /><span>&lt;/ready_to_build&gt;</span><div><Code2 size={20} /><Check size={17} /></div></div>
                    : <div className="journey-launch"><div><Rocket size={44} strokeWidth={1.3} /><span><Check size={17} /></span></div><i /><i /><i /></div>}
                </div>
              </div>}
              {item.tag && <div className="journey-floating-note"><StageIcon size={16} aria-hidden="true" /><span>{item.tag}</span></div>}
            </motion.div>
          </AnimatePresence>
          <div className="journey-progress" aria-hidden="true">{items.map((_, i) => <span key={i} data-complete={i <= index} />)}</div>
        </div>
        <div className="journey-copy"><p>{item.description}</p>{!!item.features?.length && <ul>{item.features.map((feature, i) => <li key={i}><Check size={15} aria-hidden="true" />{feature.text}</li>)}</ul>}</div>
      </div>
    </motion.div>
    <Buttons buttons={content.buttons} context={context} className="journey-actions" />
  </div>;
}
