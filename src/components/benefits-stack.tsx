import type { CSSProperties } from 'react';
import type { Content } from '@/lib/types';
import { stackOffset } from '@/lib/stacking';
import { StackingCards } from './stacking-cards';
import { SectionHeading } from './ui';

export function BenefitsStack({ content, enabled, mobile }: { content: Content; enabled: boolean; mobile: boolean }) {
  const items = content.items || [];
  return <div className="benefits-deck" style={{ '--benefit-last-offset': stackOffset(items.length - 1) } as CSSProperties}>
    <StackingCards count={items.length} animate={enabled} mobile={mobile} intro={<SectionHeading content={content} />}>
      {items.map((item, i) => <article className="stack-card benefit-card" key={i} style={{ '--stack-offset': stackOffset(i), zIndex: i + 1 } as CSSProperties}>
        <div className="stack-card-face benefit-face">
          <span className="benefit-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
          <div className="benefit-copy"><h3>{item.title}</h3>
            {!!item.features?.length && <ul>{item.features.filter(point => point.text?.trim()).map((point, j) => <li key={j}>{point.text}</li>)}</ul>}
          </div>
        </div>
      </article>)}
    </StackingCards>
  </div>;
}
