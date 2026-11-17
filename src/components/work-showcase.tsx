import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { Content, SiteContext } from '@/lib/types';
import { safeUrl, siteHref, validColor } from '@/lib/links';
import { SectionHeading, Buttons } from './ui';
import { Icon } from './icon';

export function WorkShowcase({ content, context }: { content: Content; context: SiteContext }) {
  const style = { '--showcase-columns': content.grid_columns === '3' ? 3 : 2, '--showcase-surface': validColor(content.surface_color) || '#30131d', '--showcase-ink': validColor(content.ink_color) || '#ffffff' } as CSSProperties;
  return <div className="work-showcase-layout" style={style} data-image-fit={content.image_fit || 'cover'}>
    <SectionHeading content={content} />
    <div className="work-showcase-grid">{content.items?.map((item, i) => {
      const src = safeUrl(item.image), image = src && /^(https?:\/\/|\/)/i.test(src) ? src : undefined;
      const href = siteHref(item.url, context);
      return <article className="work-showcase-card" key={i}>
        <div className="work-showcase-banner" data-has-image={!!image}>
          {image ? <img src={image} alt={item.alt || ''} loading="lazy" /> : <div className="work-showcase-art" aria-hidden="true"><Icon name={item.icon || 'code'} size={110} /><i /><i /></div>}
          {(content.banner_titles !== false || !image) && <div className="work-showcase-banner-copy">{item.category && <span>{item.category}</span>}{item.title && <h3>{item.title}</h3>}</div>}
        </div>
        <div className="work-showcase-copy">
          {content.banner_titles === false && image && item.title && <h3>{item.title}</h3>}
          {item.description && <p>{item.description}</p>}
          {href && <Link href={href} className="work-showcase-link">{item.link_label || (context.locale === 'en' ? 'Explore our work' : 'شوف أعمالنا')}<Icon name="arrow" size={20} /></Link>}
        </div>
      </article>;
    })}</div>
    <Buttons buttons={content.buttons} context={context} className="work-showcase-footer" />
  </div>;
}
