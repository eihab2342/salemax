import Link from 'next/link';
import type { CSSProperties } from 'react';
import { safeUrl, siteHref, validColor } from '@/lib/links';
import type { Item, Section, SiteData } from '@/lib/types';
import { Icon } from './icon';
import { AccentTitle, Buttons, SectionHeading } from './ui';
import { ProductPreview } from './product-preview';
import { ContactForm } from './contact-form';
import { StackingCards } from './stacking-cards';
import { stackOffset } from '@/lib/stacking';
import { motionOptions, revealAnimation } from '@/lib/motion';
import { AnimatedNumber } from './animated-number';
import { MotionMarquee } from './motion-marquee';

function mediaUrl(value?: string | null) {
  const safe = safeUrl(value); return safe && /^(https?:\/\/|\/)/i.test(safe) ? safe : undefined;
}
function Picture({ src, alt, className = '' }: { src?: string | null; alt?: string | null; className?: string }) {
  const url = mediaUrl(src); return url ? <img src={url} alt={alt || ''} className={className} loading="lazy" /> : null;
}
function Media({ url, title }: { url?: string | null; title?: string | null }) {
  const src = mediaUrl(url); if (!src) return null;
  if (/\.(mp4|webm)(?:[?#]|$)/i.test(src)) return <video className="section-video" controls preload="metadata" src={src} aria-label={title || undefined} />;
  return <Link className="media-play-link" href={src}><Icon name="play" size={25} /><span>{title}</span><Icon name="external" size={16} /></Link>;
}
function FeatureArt({ item, index }: { item: Item; index: number }) {
  if (mediaUrl(item.image)) return <div className="feature-art"><Picture src={item.image} alt={item.title} /></div>;
  return <div className={`feature-art feature-art-${index % 4}`} aria-hidden="true">
    {index % 4 === 0 ? <div className="relationship-art"><div className="relationship-hub"><Icon name="users" size={29} /></div>{[0, 1, 2, 3].map(i => <span className={'relationship-node node-' + i} key={i}><Icon name={['heart', 'messages', 'calendar', 'check'][i]} size={18} /></span>)}<i className="relationship-orbit" /><i className="relationship-orbit orbit-small" /></div>
      : index % 4 === 1 ? <div className="funnel-art">{[0, 1, 2].map(i => <div key={i}><i /><span /><span /><small><Icon name={i === 2 ? 'circlecheck' : 'more'} size={13} /></small></div>)}<span className="art-cursor"><Icon name="cursor" size={25} /></span></div>
        : index % 4 === 2 ? <div className="collaboration-art"><div>{[0, 1, 2, 3].map(i => <span key={i}><Icon name={['users', 'briefcase', 'heart', 'target'][i]} size={20} /></span>)}</div><i /><div className="collaboration-check"><Icon name="circlecheck" size={18} /><span>{item.tag}</span></div></div>
          : <div className="insight-art"><div className="insight-line"><svg viewBox="0 0 280 100" fill="none"><path d="M5 90C25 85 25 65 50 72S80 90 100 60S125 70 148 42S173 55 195 28S220 32 240 13S265 15 275 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg></div><div>{[35, 55, 42, 75, 62, 88, 100, 82, 115].map((height, i) => <span style={{ height }} key={i} />)}</div></div>}
  </div>;
}

export function SectionRenderer({ section, index, site }: { section: Section; index: number; site: SiteData }) {
  const content = section.content || {};
  const items = content.items || [];
  const context = site.context;
  const motion = motionOptions(site.settings.motion);
  const animate = motion.enabled && section.settings?.motion !== 'none';
  const labels = site.settings.interface || {};
  const style: CSSProperties = {
    ...{ '--reveal-animation': section.settings?.motion === 'inherit' ? undefined : revealAnimation(section.settings?.motion), '--motion-duration': section.settings?.motion_duration ? `${Math.max(250, Math.min(2000, section.settings.motion_duration))}ms` : undefined, '--section-delay': `${Math.max(0, Math.min(1200, section.settings?.motion_delay || 0))}ms` },
    backgroundColor: validColor(section.settings?.background),
    textAlign: ['start', 'center', 'end'].includes(section.settings?.alignment || '') ? section.settings?.alignment as CSSProperties['textAlign'] : undefined,
  };
  const id = section.settings?.anchor || `${section.type}-${index}`;
  const props = { id, style, 'data-spacing': section.settings?.spacing || 'normal', 'data-variant': section.settings?.variant || 'classic', 'data-section-index': index, 'data-section-motion': section.settings?.motion || 'inherit', 'data-motion-once': section.settings?.motion_once !== false };
  const link = (item: Item) => siteHref(item.url, context);
  if (section.type === 'marquee') {
    if (!items.some(item => item.text)) return null;
    return <section {...props} className="section marquee-section"><div className="container"><SectionHeading content={content} /></div><MotionMarquee content={content} enabled={animate && motion.marquee} locale={context.locale} /></section>;
  }
  if (section.type === 'hero') {
    const visual = !!(content.preview_columns?.length || content.image || content.video_url);
    return <section {...props} className={`hero ${visual ? 'hero-with-visual' : 'hero-compact'}`}>
      <div className="container hero-inner">{visual && <><div className="hero-atmosphere" aria-hidden="true"><i /><i /><i /></div><span className="hero-watermark" aria-hidden="true">{site.settings.brand?.name}</span></>}<div className="hero-copy">
        {content.eyebrow && <span className="eyebrow hero-eyebrow"><i />{content.eyebrow}</span>}
        <h1><AccentTitle text={content.title} accent={content.title_accent} /></h1>
        {content.description && <p className="hero-description">{content.description}</p>}
        <Buttons buttons={content.buttons} context={context} />
        {!!content.notes?.length && <div className="hero-notes">{content.notes.map((note, i) => <span key={i}><Icon name="check" size={14} />{note.text}</span>)}</div>}
      </div>{visual && <div className="hero-visual">{content.image ? <Picture src={content.image} alt={content.image_alt || content.title} className="hero-image" /> : <ProductPreview content={content} />}<Media url={content.video_url} title={content.title} /></div>}</div>
      <div className="hero-bottom-line container" aria-hidden="true"><span /><Icon name="down" size={20} /><span /></div>
    </section>;
  }
  if (section.type === 'stats') {
    if (!items.length) return null;
    return <section {...props} className="stats-section"><div className="container"><SectionHeading content={content} /><div className="stats-row">{items.map((item, i) => <div key={i}><span className="stat-mark">{String(i + 1).padStart(2, '0')}</span><AnimatedNumber value={item.value} locale={context.locale} enabled={animate && motion.counters} duration={section.settings?.motion_duration || motion.duration} mobile={motion.mobile} /><p>{item.label}</p></div>)}</div></div></section>;
  }
  if (section.type === 'features') {
    if (!items.length) return null;
    if ((!section.settings?.variant || section.settings.variant === 'classic') && content.layout !== 'bento') {
      const anchor = (item: Item, i: number) => item.anchor && /^[a-z][a-z0-9_-]*$/i.test(item.anchor) ? item.anchor : `${id}-card-${i + 1}`;
      return <section {...props} className="section features-section features-stacked"><div className="container"><StackingCards animate={animate} mobile={motion.mobile} count={items.length} intro={<>
        <SectionHeading content={content} />
        <ol className="stack-index">{items.map((item, i) => <li key={i}><a href={'#' + anchor(item, i)} aria-current={i === 0 ? 'step' : undefined}><span className="stack-index-number">{String(i + 1).padStart(2, '0')}</span><span>{item.tag || item.title}</span><Icon name="arrow" size={16} /></a></li>)}</ol>
      </>}>
        {items.map((item, i) => <article key={i} id={anchor(item, i)} className={`stack-card stack-card-${i % 4}`} style={{ '--stack-offset': stackOffset(i), zIndex: i + 1 } as CSSProperties}>
          <div className="stack-card-face"><header className="stack-card-meta"><span className="stack-card-number">{String(i + 1).padStart(2, '0')}<i> / {String(items.length).padStart(2, '0')}</i></span><span className="feature-tag"><Icon name={item.icon} size={16} />{item.tag}</span><span className="stack-card-mark" aria-hidden="true"><Icon name={item.icon} size={19} /></span></header>
            <div className="stack-card-main"><div className="feature-card-text"><h3>{item.title}</h3><p>{item.description}</p>{link(item) && item.link_label && <Link className="text-link" href={link(item)!}><span>{item.link_label}</span><i><Icon name="arrow" size={18} /></i></Link>}</div><FeatureArt item={item} index={i} /></div>
          </div>
        </article>)}
      </StackingCards></div></section>;
    }
    return <section {...props} className="section features-section"><div className="container"><SectionHeading content={content} /><div className="features-bento">{items.map((item, i) => <article className={`feature-card feature-card-${i % 4}`} key={i} id={item.anchor && /^[a-z][a-z0-9_-]*$/i.test(item.anchor) ? item.anchor : undefined}>
      <div className="feature-card-text"><span className="feature-tag"><Icon name={item.icon} size={16} />{item.tag}</span><h3>{item.title}</h3><p>{item.description}</p>{link(item) && item.link_label && <Link className="text-link" href={link(item)!}>{item.link_label}<Icon name="arrow" size={18} /></Link>}</div><FeatureArt item={item} index={i} />
    </article>)}</div></div></section>;
  }
  if (section.type === 'solutions') {
    return <section {...props} className="section solutions-section"><div className="container"><div className="split-heading"><SectionHeading content={content} /><div className="solutions-decoration" aria-hidden="true"><i /><Icon name="sparkles" size={45} /></div></div><div className="solutions-grid">{items.map((item, i) => <article className="solution-card" key={i}><div className="solution-top"><Icon name={item.icon} size={30} /><span>{String(i + 1).padStart(2, '0')}</span></div>{item.category && <small className="latin-label">{item.category}</small>}<h3>{item.title}</h3><p>{item.description}</p>{link(item) && <Link href={link(item)!} className="solution-link"><span>{item.link_label || labels.read_more}</span><Icon name="arrow" size={20} /></Link>}</article>)}</div></div></section>;
  }
  if (section.type === 'story') {
    return <section {...props} className="section story-section"><div className="container story-layout"><SectionHeading content={content} /><div>{content.body && <p className="prose-body">{content.body}</p>}<Picture src={content.image} alt={content.title} />{items.map((item, i) => <article className="story-step" key={i}><span className="step-number">{item.label || String(i + 1).padStart(2, '0')}</span><div><h3>{item.title}</h3><p>{item.description}</p></div></article>)}</div></div></section>;
  }
  if (section.type === 'resources') {
    return <section {...props} className="section resources-section"><div className="container"><div className="split-heading"><SectionHeading content={content} />{labels.all_resources && <Link className="text-link" href={siteHref('/resources', context)!}>{labels.all_resources}<Icon name="arrow" size={18} /></Link>}</div><div className="resource-grid">{items.map((item, i) => <article className="resource-card" key={i}><Link className={`resource-art resource-art-${i % 3}`} href={link(item) || '#'} tabIndex={-1} aria-hidden="true">{item.image ? <Picture src={item.image} alt="" /> : <><span className="resource-orbit" /><span className="resource-art-icon"><Icon name={item.icon} size={48} /></span><span className="resource-gridlines" /></>}</Link><div className="resource-meta"><span><i />{item.category}</span><Icon name="arrow" size={18} /></div><h3><Link href={link(item) || '#'}>{item.title}</Link></h3><p>{item.description}</p>{item.link_label && <Link className="text-link" href={link(item) || '#'}>{item.link_label}<Icon name="left" size={17} /></Link>}</article>)}</div></div></section>;
  }
  if (section.type === 'faq') {
    if (!items.length) return null;
    return <section {...props} className="section faq-section"><div className="container faq-layout"><div><SectionHeading content={content} /><div className="faq-emblem" aria-hidden="true"><Icon name="messages" size={40} /><span>?</span></div></div><div className="faq-list">{items.map((item, i) => <details key={i} name={`faq-${index}`} open={i === 0}><summary><span>{item.question}</span><i><Icon name="plus" size={18} /></i></summary><div><p>{item.answer}</p></div></details>)}</div></div></section>;
  }
  if (section.type === 'cta') {
    return <section {...props} className="cta-section"><div className="container"><div className="cta-box"><div className="cta-lines" aria-hidden="true"><span /><span /><span /><span /></div><div className="cta-spark" aria-hidden="true">✳</div><SectionHeading content={content} light /><Buttons buttons={content.buttons} context={context} /><Picture src={content.image} alt={content.title} /></div></div></section>;
  }
  if (section.type === 'form') {
    const form = site.forms.find(form => form.slug === content.form_slug);
    return <section {...props} className="section form-section"><div className="container form-layout"><div><SectionHeading content={content} /><div className="form-aside-art" aria-hidden="true"><span><Icon name="messages" size={50} /></span><i /><Icon name="sparkles" size={28} /></div>
      <div className="contact-methods">{site.settings.contact?.email && <a href={'mailto:' + site.settings.contact.email}><Icon name="mail" /><span>{site.settings.contact.email}</span></a>}{site.settings.contact?.phone && <a href={'tel:' + site.settings.contact.phone.replace(/\s/g, '')}><Icon name="phone" /><span dir="ltr">{site.settings.contact.phone}</span></a>}</div></div>
      {form ? <ContactForm form={form} labels={labels} preview={context.preview} /> : <div className="form-unavailable"><Icon name="mail" size={30} /><p>{labels.form_unavailable}</p></div>}
    </div></section>;
  }
  if (section.type === 'pricing') {
    if (!items.length) return null;
    return <section {...props} className="section pricing-section"><div className="container"><SectionHeading content={content} /><div className="pricing-grid">{items.map((item, i) => <article key={i} className={`price-card ${item.highlighted ? 'highlighted' : ''}`}><h3>{item.name}</h3><p>{item.description}</p><div className="price-value">{item.price}<small>{item.currency}</small></div><span className="price-period">{item.period}</span><ul>{item.features?.map((feature, j) => <li key={j}><Icon name="check" size={17} />{feature.text}</li>)}</ul><Buttons buttons={[{ label: item.button_label, url: item.button_url, variant: item.highlighted ? 'primary' : 'outline' }]} context={context} /></article>)}</div></div></section>;
  }
  if (section.type === 'clients' || section.type === 'partners') {
    if (!items.length) return null;
    return <section {...props} className={`section logos-section ${section.type}`}><div className="container"><SectionHeading content={content} /><div className="logos-grid">{items.map((item, i) => <div key={i}>{item.url ? <Link href={link(item) || '#'}><Picture src={item.image} alt={item.name || item.title} /><span>{item.name || item.title}</span></Link> : <><Picture src={item.image} alt={item.name || item.title} /><span>{item.name || item.title}</span></>}{item.description && <p>{item.description}</p>}</div>)}</div></div></section>;
  }
  if (section.type === 'testimonials') {
    if (!items.length) return null;
    return <section {...props} className="section testimonials-section"><div className="container"><SectionHeading content={content} /><div className="testimonials-grid">{items.map((item, i) => <figure key={i}><Icon name="quote" size={32} /><blockquote>{item.quote}</blockquote><figcaption><Picture src={item.image} alt={item.name} /><div><strong>{item.name}</strong><small>{[item.role, item.company].filter(Boolean).join(' · ')}</small></div></figcaption></figure>)}</div></div></section>;
  }
  if (section.type === 'team') {
    if (!items.length) return null;
    return <section {...props} className="section team-section"><div className="container"><SectionHeading content={content} /><div className="team-grid">{items.map((item, i) => <article key={i}><Picture src={item.image} alt={item.name} /><h3>{item.name}</h3><p>{item.role}</p>{link(item) && <Link href={link(item)!} aria-label={item.name || undefined}><Icon name="external" /></Link>}</article>)}</div></div></section>;
  }
  if (section.type === 'gallery') {
    if (!items.length) return null;
    return <section {...props} className="section gallery-section"><div className="container"><SectionHeading content={content} /><div className="gallery-grid">{items.map((item, i) => <figure key={i}><Picture src={item.image} alt={item.alt || item.title} /><Media url={item.video_url} title={item.title} />{item.title && <figcaption>{item.title}</figcaption>}</figure>)}</div></div></section>;
  }
  if (section.type === 'contact') {
    if (!items.length) return null;
    return <section {...props} className="section offices-section"><div className="container"><SectionHeading content={content} /><div className="offices-grid">{items.map((item, i) => <article key={i}><Icon name="map" size={30} /><h3>{item.name}</h3><p>{item.address}</p>{item.phone && <a href={'tel:' + item.phone.replace(/\s/g, '')}>{item.phone}</a>}{item.email && <a href={'mailto:' + item.email}>{item.email}</a>}{safeUrl(item.map_url) && <a href={safeUrl(item.map_url)} className="text-link"><Icon name="map" />{item.name}</a>}</article>)}</div></div></section>;
  }
  if (section.type === 'text') {
    return <section {...props} className="section text-section"><div className="container prose"><SectionHeading content={content} />{content.body && <div className="prose-body">{content.body}</div>}</div></section>;
  }
  return null;
}
