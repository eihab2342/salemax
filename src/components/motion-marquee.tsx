'use client';

import { useState, type CSSProperties } from 'react';
import type { Content } from '@/lib/types';
import { Icon } from './icon';

export function MotionMarquee({ content, enabled, locale }: { content: Content; enabled: boolean; locale: string }) {
  const [paused, setPaused] = useState(false);
  const items = content.items?.filter(item => item.text) || [];
  const seconds = content.speed === 'fast' ? 18 : content.speed === 'slow' ? 55 : 32;
  const group = (duplicate: boolean) => <ul className="motion-marquee-group" aria-hidden={duplicate || undefined}>{items.map((item, index) => <li key={index}><Icon name={item.icon || 'sparkles'} size={25} /><span>{item.text}</span></li>)}</ul>;
  return <div className="motion-marquee" data-enabled={enabled} data-running={enabled && !paused} data-direction={content.direction === 'right' ? 'right' : 'left'} style={{ '--marquee-duration': `${seconds}s` } as CSSProperties}>
    <div className="motion-marquee-window"><div className="motion-marquee-track">{group(false)}{enabled && group(true)}</div></div>
    {enabled && <button type="button" className="marquee-pause" aria-pressed={paused} onClick={() => setPaused(!paused)}>{locale === 'en' ? paused ? 'Play motion' : 'Pause motion' : paused ? 'تشغيل الحركة' : 'إيقاف الحركة'}<span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span></button>}
  </div>;
}
