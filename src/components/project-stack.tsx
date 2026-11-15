import Link from 'next/link';
import type { CSSProperties } from 'react';
import type { Content, Item, SiteContext } from '@/lib/types';
import { safeUrl, siteHref, validColor } from '@/lib/links';
import { stackOffset } from '@/lib/stacking';
import { StackingCards } from './stacking-cards';
import { Buttons, SectionHeading } from './ui';
import { Icon } from './icon';

function imageUrl(value?: string | null) { const url = safeUrl(value); return url && /^(https?:\/\/|\/)/i.test(url) ? url : undefined; }
function contrast(color: string) {
  const channels = [1, 3, 5].map(i => parseInt(color.slice(i, i + 2), 16) / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722 > .179 ? '#242329' : '#ffffff';
}

export function ProjectStack({ content, context, enabled, mobile }: { content: Content; context: SiteContext; enabled: boolean; mobile: boolean }) {
  const en = context.locale === 'en';
  let items: Item[] = (content.items || []).filter(item => item.title || imageUrl(item.image) || item.description);
  const demo = !items.length;
  if (demo && !context.preview) return null;
  if (demo) items = [0, 1, 2].map(i => ({ title: en ? `Project card preview ${i + 1}` : `معاينة كارت المشروع ${i + 1}`, category: en ? 'Preview only' : 'معاينة فقط', description: en ? 'Add the project name, description, logo, image and details link from this section’s Content tab.' : 'أضف اسم المشروع ووصفه وشعاره وصورته ورابط التفاصيل من تبويب المحتوى في هذا القسم.' }));
  const step = ['12', '20', '28', '36'].includes(content.stack_step || '') ? Number(content.stack_step) : 20;
  const intro = <div className="project-stack-heading"><SectionHeading content={{ ...content, description: undefined }} /><Buttons buttons={content.buttons} context={context} />{content.description && <p>{content.description}</p>}{demo && <p className="project-stack-preview-note">{en ? 'These are layout previews, not published projects. Replace them by adding your real projects.' : 'هذه معاينة للتصميم فقط وليست مشاريع منشورة. أضف مشاريعكم الفعلية لإظهار القسم للزوار.'}</p>}</div>;
  return <div className="project-stack-deck" style={{ '--project-stack-step': `${step}px`, '--project-stack-last-offset': stackOffset(items.length - 1) } as CSSProperties}>
    <StackingCards intro={intro} count={items.length} animate={enabled} mobile={mobile}>
      {items.map((item, index) => {
        const color = validColor(item.background || undefined), image = imageUrl(item.image), logo = imageUrl(item.logo), href = siteHref(item.url, context);
        const colors = ['#df9e6e', '#6eb896', '#8594ba', '#d78ba5'];
        const style = { '--stack-offset': stackOffset(index), zIndex: index + 1 } as CSSProperties;
        const faceStyle = { '--project-surface': color || `color-mix(in srgb,var(--page-background) 86%,${colors[index % 4]} 14%)`, '--project-ink': color ? contrast(color) : 'var(--ink)' } as CSSProperties;
        return <article className="stack-card project-stack-card" key={index} style={style}>
          <div className="stack-card-face project-stack-face" style={faceStyle}>
            <div className="project-card-body">
              {logo && <div className="project-card-logo"><img src={logo} alt={item.title || ''} loading="lazy" /></div>}
              <div className="project-card-copy">
                {item.category && <span className="project-card-category">{item.category}</span>}
                {item.title && <h3><span>{index + 1}. </span>{item.title}</h3>}
                {item.description && <p>{item.description}</p>}
              </div>
              {href && <Link className="project-card-button" href={href}>{item.link_label || (en ? 'Project details' : 'تفاصيل المشروع')}<Icon name="arrow" size={18} /></Link>}
            </div>
            <div className="project-card-media">
              {image || logo ? <img src={image || logo} alt={item.alt || item.title || ''} loading="lazy" /> : demo ? <div className="project-card-image-empty" aria-hidden="true"><Icon name="smartphone" size={90} /></div> : null}
            </div>
          </div>
        </article>;
      })}
    </StackingCards>
  </div>;
}
