import Link from 'next/link';
import type { Content, SiteContext } from '@/lib/types';
import { siteHref } from '@/lib/links';
import { Icon } from './icon';

export function HeroServicePreview({ content, context, brand }: { content: Content; context: SiteContext; brand?: string }) {
  return <div className="hero-service-preview">
    <div className="hero-service-preview-top"><strong>{brand}</strong><span aria-hidden="true"><i /><i /><i /></span></div>
    <div className="hero-service-preview-cards">{content.preview_tabs?.map((item, index) => {
      const href = siteHref(item.url, context);
      const body = <><span className="hero-service-preview-icon"><Icon name={item.icon || 'code'} size={26} /></span><span className="hero-service-preview-copy"><strong>{item.label}</strong>{item.description && <span>{item.description}</span>}</span><span className="hero-service-preview-art" data-kind={item.icon} aria-hidden="true"><i /><i /><i /></span></>;
      return href ? <Link className="hero-service-preview-card" href={href} key={index}>{body}</Link> : <div className="hero-service-preview-card" key={index}>{body}</div>;
    })}</div>
  </div>;
}
