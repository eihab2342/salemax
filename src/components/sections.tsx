import Link from 'next/link';
import type { CSSProperties } from 'react';
import { safeUrl, validColor } from '@/lib/links';
import type { Section, SiteData } from '@/lib/types';
import { Icon } from './icon';
import { AccentTitle, Buttons, SectionHeading } from './ui';
import { ContactForm } from './contact-form';
import { motionOptions, revealAnimation } from '@/lib/motion';
import { ProjectShowcase } from './project-showcase';
import { ProjectStack } from './project-stack';
import { ServiceGrid } from './service-grid';
import { BenefitsStack } from './benefits-stack';
import { ProjectDetail } from './project-detail';

function mediaUrl(value?: string | null) {
  const safe = safeUrl(value); return safe && /^(https?:\/\/|\/)/i.test(safe) ? safe : undefined;
}
function Picture({ src, alt, className = '', priority = false }: { src?: string | null; alt?: string | null; className?: string; priority?: boolean }) {
  const url = mediaUrl(src); return url ? <img src={url} alt={alt || ''} className={className} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined} /> : null;
}
function Media({ url, title }: { url?: string | null; title?: string | null }) {
  const src = mediaUrl(url); if (!src) return null;
  if (/\.(mp4|webm)(?:[?#]|$)/i.test(src)) return <video className="section-video" controls preload="metadata" src={src} aria-label={title || undefined} />;
  return <Link className="media-play-link" href={src}><Icon name="play" size={25} /><span>{title}</span><Icon name="external" size={16} /></Link>;
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
  const props = { id, style, 'data-content-width': section.settings?.content_width || 'normal', 'data-spacing': section.settings?.spacing || 'normal', 'data-variant': section.settings?.variant || 'classic', 'data-section-index': index, 'data-section-motion': section.settings?.motion || 'inherit', 'data-motion-once': section.settings?.motion_once !== false };
  const settings = section.settings || {};
  if (section.type === 'project_detail') return <section {...props} className="project-detail"><ProjectDetail content={content} context={context} /></section>;
  if (section.type === 'benefits') {
    if (!items.length) return null;
    return <section {...props} style={{ ...style, '--benefit-surface': validColor(content.surface_color) || '#101012', '--benefit-ink': validColor(content.ink_color) || '#ffffff', '--benefit-accent': validColor(content.accent_color) || '#ff7199' } as CSSProperties} className="section benefits-section"><div className="container"><BenefitsStack content={content} enabled={animate} mobile={motion.mobile} /></div></section>;
  }
  if (section.type === 'solutions') {
    if (!items.length) return null;
    return <section {...props} className="section service-grid-section"><div className="container"><ServiceGrid content={content} context={context} /></div></section>;
  }
  if (section.type === 'projects') {
    if (!context.preview && !items.some(item => item.title || mediaUrl(item.image) || item.description)) return null;
    return <section {...props} className="section project-stack"><div className="container"><ProjectStack content={content} context={context} enabled={animate} mobile={motion.mobile} /></div></section>;
  }
  if (section.type === 'gallery') {
    if (!context.preview && !items.some(item => mediaUrl(item.image))) return null;
    return <section {...props} className="section project-showcase-section">
      <div className="container"><SectionHeading content={content} /></div>
      <ProjectShowcase content={content} context={context} enabled={animate} mobile={motion.mobile} />
    </section>;
  }
  if (section.type === 'hero') {
    if (settings.variant !== 'spotlight') return <section {...props} className="hero split-hero">
      <div className="container split-hero-layout">
        <div className="split-hero-copy">
          {content.eyebrow && <span className="split-hero-eyebrow">{content.eyebrow}</span>}
          <h1><AccentTitle text={content.title} accent={content.title_accent} /></h1>
          {content.description && <p className="split-hero-description">{content.description}</p>}
          {(content.preview_title || content.preview_tabs?.length) && <div className="split-hero-services">
            {content.preview_title && <h2>{content.preview_title}</h2>}
            {!!content.preview_tabs?.length && <ul>{content.preview_tabs.map((tab, i) => <li key={i}>{tab.label}</li>)}</ul>}
          </div>}
          <Buttons buttons={content.buttons} context={context} />
          {!!content.notes?.length && <ul className="split-hero-notes">{content.notes.map((note, i) => <li key={i}><Icon name="check" size={15} />{note.text}</li>)}</ul>}
        </div>
        <div className={`split-hero-media ${mediaUrl(content.image) ? 'has-image' : ''}`}>
          {mediaUrl(content.image) ? <Picture src={content.image} alt={content.image_alt || content.title} className="split-hero-image" priority /> : <div className="split-hero-fallback" aria-hidden="true"><span>{site.settings.brand?.name}</span><i /><i /></div>}
          <Media url={content.video_url} title={content.title} />
        </div>
      </div>
    </section>;
    if (settings.variant === 'spotlight') {
      const metrics = content.preview_metrics?.filter(metric => metric.label || metric.value) || [];
      const summaries: { label?: string | null; value?: string | null; icon?: string | null }[] = metrics.length ? metrics : content.preview_tabs?.length ? content.preview_tabs : content.notes?.map(note => ({ label: note.text, icon: 'check' })) || [];
      return <section {...props} className={`hero cinematic-hero ${summaries.length ? 'has-summary' : ''}`} data-has-image={!!mediaUrl(content.image)}>
        <div className="cinematic-background" aria-hidden="true"><Picture src={content.image} alt="" className="cinematic-image" priority /><div className="cinematic-overlay" /></div>
        <div className="container cinematic-content">
          {content.eyebrow && <span className="cinematic-eyebrow">{content.eyebrow}</span>}
          <h1><AccentTitle text={content.title} accent={content.title_accent} /></h1>
          {content.description && <p className="cinematic-description">{content.description}</p>}
          <Buttons buttons={content.buttons} context={context} />
          <Media url={content.video_url} title={content.preview_title || content.title} />
        </div>
        {!!summaries.length && <div className="container cinematic-summary" style={{ '--summary-columns': Math.min(4, summaries.length) } as CSSProperties}>
          {summaries.map((summary, i) => <div className="cinematic-summary-item" key={i}>
            {summary.value ? <strong>{summary.value}</strong> : <Icon name={summary.icon || 'check'} size={25} />}
            <span>{summary.label}</span>
          </div>)}
        </div>}
      </section>;
    }
  }
  if (section.type === 'form') {
    const form = site.forms.find(form => form.slug === content.form_slug);
    return <section {...props} className="section form-section"><div className="container form-layout"><div><SectionHeading content={content} /><div className="form-aside-art" aria-hidden="true"><span><Icon name="messages" size={50} /></span><i /><Icon name="sparkles" size={28} /></div>
      <div className="contact-methods">{site.settings.contact?.email && <a href={'mailto:' + site.settings.contact.email}><Icon name="mail" /><span>{site.settings.contact.email}</span></a>}{site.settings.contact?.phone && <a href={'tel:' + site.settings.contact.phone.replace(/\s/g, '')}><Icon name="phone" /><span dir="ltr">{site.settings.contact.phone}</span></a>}</div></div>
      {form ? <ContactForm form={form} labels={labels} preview={context.preview} /> : <div className="form-unavailable"><Icon name="mail" size={30} /><p>{labels.form_unavailable}</p></div>}
    </div></section>;
  }
  if (section.type === 'text') {
    return <section {...props} className="section text-section"><div className="container prose"><SectionHeading content={content} />{content.body && <div className="prose-body">{content.body}</div>}</div></section>;
  }
  return null;
}
