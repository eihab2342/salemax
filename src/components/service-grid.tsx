import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { Content, SiteContext } from '@/lib/types';
import { safeUrl, siteHref } from '@/lib/links';
import { Icon } from './icon';
import { Buttons, SectionHeading } from './ui';

export function ServiceGrid({ content, context }: { content: Content; context: SiteContext }) {
  const headerLink = siteHref(content.header_link_url, context);
  const number = (value: string | undefined, fallback: number, allowed: number[]) => allowed.includes(Number(value)) ? Number(value) : fallback;
  const style = { '--service-columns': number(content.grid_columns, 4, [2, 3, 4]), '--service-tablet-columns': number(content.grid_tablet_columns, 2, [1, 2, 3]), '--service-mobile-columns': number(content.grid_mobile_columns, 1, [1, 2]), '--service-gap': `${number(content.grid_gap, 32, [16, 24, 32, 48])}px` } as CSSProperties;
  return <div className="service-grid-layout" style={style} data-image-fit={content.image_fit || 'cover'}>
    <div className="service-grid-heading">
      <SectionHeading content={{ ...content, description: undefined }} />
      {headerLink && content.header_link_label && <Link href={headerLink} className="service-grid-about">{content.header_link_label}<Icon name="arrow" size={21} /></Link>}
      {content.description && <p>{content.description}</p>}
    </div>
    <div className="service-grid-cards">{content.items?.map((item, index) => {
      const src = safeUrl(item.image), image = src && /^(https?:\/\/|\/)/i.test(src) ? src : undefined;
      const href = siteHref(item.url, context);
      return <article className="service-grid-card" key={index} id={item.anchor && /^[a-z][a-z0-9_-]*$/i.test(item.anchor) ? item.anchor : undefined}>
        <div className="service-grid-image">{image ? <img src={image} alt={item.title || ''} loading="lazy" /> : <div className="service-grid-image-fallback" aria-hidden="true"><Icon name={item.icon || 'code'} size={50} /></div>}</div>
        {item.title && <h3>{href ? <Link href={href}>{item.title}</Link> : item.title}</h3>}
        {item.description && <p>{item.description}</p>}
        {href && <Link className="service-grid-button" href={href}>{item.link_label || (context.locale === 'en' ? 'Request this service' : 'اطلب الخدمة')}<span><Icon name="arrow" size={18} /></span></Link>}
      </article>;
    })}</div>
    <Buttons buttons={content.buttons} context={context} className="service-grid-footer" />
  </div>;
}
