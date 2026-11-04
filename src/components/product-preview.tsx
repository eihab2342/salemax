'use client';

import { useId, useState } from 'react';
import type { Content } from '@/lib/types';
import { validColor } from '@/lib/links';
import { BrandMark } from './ui';
import { Icon } from './icon';

export function ProductPreview({ content }: { content: Content }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const columns = content.preview_columns || [];
  const cards = columns.flatMap(column => column.cards || []);
  if (!content.preview_title || !columns.length) return null;
  return <div className="product-scene">
    <div className="scene-orbit orbit-one" /><div className="scene-orbit orbit-two" /><div className="scene-spark spark-one">✳</div><div className="scene-spark spark-two">+</div>
    <div className="product-window">
      <div className="product-topbar"><div className="product-brand"><BrandMark /><span>{content.preview_title}</span></div><div className="product-toolbar"><Icon name="search" size={15} /><Icon name="bell" size={15} /><span className="product-avatar">S</span></div></div>
      <div className="product-body"><aside className="product-rail"><Icon name="dashboard" /><span className="rail-active"><Icon name="chart" /></span><Icon name="users" /><Icon name="calendar" /><Icon name="messages" /></aside>
        <div className="product-content"><div className="product-heading"><div><small>{content.eyebrow?.split('·')[0]}</small><h3>{content.preview_title}<span className="tiny-dot" /></h3></div><div className="product-toolbar"><span className="tiny-pill"><Icon name="plus" size={13} /></span><Icon name="more" size={16} /></div></div>
          <div className="product-metrics">{content.preview_metrics?.map((metric, index) => <div key={index}><span className={'metric-symbol metric-' + index}><Icon name={metric.icon} size={16} /></span><span>{metric.label}</span><strong>{metric.value}</strong><i><Icon name="trend" size={12} /></i></div>)}</div>
          <div className="product-tabs" role="tablist" onKeyDown={event => {
            const count = content.preview_tabs?.length || 0;
            if (!count || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            const next = event.key === 'Home' ? 0 : event.key === 'End' ? count - 1 : (active + (event.key === 'ArrowLeft' ? 1 : -1) + count) % count;
            setActive(next); document.getElementById(`${id}-tab-${next}`)?.focus();
          }}>{content.preview_tabs?.map((tab, index) => <button key={index} id={`${id}-tab-${index}`} role="tab" tabIndex={active === index ? 0 : -1} aria-selected={active === index} aria-controls={`${id}-panel`} onClick={() => setActive(index)}><Icon name={tab.icon} size={14} />{tab.label}{index === 0 && <span>{cards.length}</span>}</button>)}</div>
          <div className="product-panel" id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${active}`}>
            {active === 0 ? <div className="pipeline">{columns.map((column, index) => <div className="pipeline-column" key={index}><h4><i style={{ background: validColor(column.color) }} />{column.title}<span>{column.cards?.length || 0}</span><Icon name="more" size={12} /></h4>
              {column.cards?.map((card, i) => <div className="deal-card" key={i}><div><span className="deal-dot" /><Icon name="more" size={12} /></div><h5>{card.name}</h5><p>{card.description}</p><footer><span className="deal-tag">{card.tag}</span><span className="deal-avatar">{card.initials}</span></footer></div>)}</div>)}</div>
              : active === 1 ? <div className="contacts-preview">{cards.map((card, i) => <div key={i}><span className="deal-avatar">{card.initials}</span><div><strong>{card.name}</strong><small>{card.description}</small></div><span className="deal-tag">{card.tag}</span><Icon name="arrow" size={14} /></div>)}</div>
                : <div className="reports-preview"><div className="report-bars">{columns.map((column, i) => <div key={i}><span style={{ height: `${55 + (column.cards?.length || 0) * 38}px`, background: validColor(column.color) }} /><small>{column.title}</small></div>)}</div><div className="report-summary">{content.preview_metrics?.map((metric, i) => <p key={i}><span>{metric.label}</span><strong>{metric.value}</strong></p>)}</div></div>}
          </div>
        </div>
      </div>
    </div>
    {content.preview_badge && <div className="floating-proof"><span className="proof-icon"><Icon name="circlecheck" size={24} /></span><div><strong>{content.preview_badge}</strong><small>{content.preview_badge_text}</small></div><span className="proof-spark">✧</span></div>}
    {content.preview_note && <p className="product-caption">{content.preview_note}</p>}
  </div>;
}
