import Link from 'next/link';
import type { Content, SiteContext } from '@/lib/types';
import { safeUrl, siteHref } from '@/lib/links';
import { AccentTitle, Buttons } from './ui';
import { Icon } from './icon';

function Picture({ src, alt = '' }: { src?: string | null; alt?: string | null }) {
  const url = safeUrl(src);
  return url && /^(https?:\/\/|\/)/i.test(url) ? <img src={url} alt={alt || ''} loading="lazy" /> : null;
}
export function ProjectDetail({ content: c, context }: { content: Content; context: SiteContext }) {
  const back = siteHref(c.back_url || '/#selected-projects', context)!;
  return <div className="container project-detail-container">
    <div className="project-detail-hero" data-has-image={!!safeUrl(c.image)}>
      <div className="project-detail-copy">
        <Link className="project-back" href={back}><Icon name="arrow" size={18} />{c.back_label || (context.locale === 'en' ? 'Back to projects' : 'العودة للأعمال')}</Link>
        {c.category && <span className="project-detail-category">{c.category}</span>}
        <h1><AccentTitle text={c.title} accent={c.title_accent} /></h1>
        {c.description && <p>{c.description}</p>}
        <Buttons buttons={c.buttons} context={context} />
      </div>
      {safeUrl(c.image) && <div className="project-detail-cover"><Picture src={c.image} alt={c.image_alt || c.title} /></div>}
    </div>
    {!!c.technologies?.length && <section className="project-technologies">
      {c.technologies_title && <h2>{c.technologies_title}</h2>}{c.technologies_description && <p>{c.technologies_description}</p>}
      <ul>{c.technologies.map((tech, i) => <li key={i}><Picture src={tech.image} alt="" /><span>{tech.title}</span></li>)}</ul>
    </section>}
    {c.blocks?.map((block, i) => <section className="project-detail-block" data-image-side={block.image_side || (i % 2 ? 'start' : 'end')} data-has-image={!!safeUrl(block.image)} key={i}>
      <div className="project-block-copy"><h2><Icon name={['target', 'code', 'chart'][i % 3]} size={28} />{block.title}</h2>
        {block.description && <p>{block.description}</p>}
        {!!block.points?.length && <ul>{block.points.filter(point => point.text?.trim()).map((point, j) => <li key={j}><span aria-hidden="true">{String(j + 1).padStart(2, '0')}</span><p>{point.text}</p></li>)}</ul>}
      </div>
      {safeUrl(block.image) && <div className="project-block-image"><Picture src={block.image} alt={block.alt || block.title} /></div>}
    </section>)}
    {!!c.gallery?.some(item => safeUrl(item.image)) && <section className="project-detail-gallery">{c.gallery_title && <h2>{c.gallery_title}</h2>}
      <div>{c.gallery.filter(item => safeUrl(item.image)).map((item, i) => <a href={safeUrl(item.image)} target="_blank" rel="noopener noreferrer" key={i}><Picture src={item.image} alt={item.alt} /></a>)}</div>
    </section>}
    {!!c.downloads?.some(item => safeUrl(item.url)) && <section className="project-downloads">{c.downloads_title && <h2>{c.downloads_title}</h2>}
      <div>{c.downloads.filter(item => safeUrl(item.url)).map((item, i) => <a href={siteHref(item.url, context)} key={i}>{item.image ? <Picture src={item.image} alt={item.label} /> : item.label}<Icon name="external" size={18} /></a>)}</div>
    </section>}
  </div>;
}
