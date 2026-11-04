import Link from 'next/link';
import type { ButtonData, Content, SiteContext } from '@/lib/types';
import { siteHref } from '@/lib/links';
import { Icon } from './icon';

export function BrandMark() {
  return <span className="brand-symbol" aria-hidden="true"><i /><i /><i /></span>;
}
export function AccentTitle({ text, accent }: { text?: string | null; accent?: string | null }) {
  if (!text) return null;
  if (!accent || !text.includes(accent)) return <>{text}</>;
  const index = text.indexOf(accent);
  return <>{text.slice(0, index)}<span className="accent-text">{accent}</span>{text.slice(index + accent.length)}</>;
}
export function SectionHeading({ content, light = false }: { content: Content; light?: boolean }) {
  if (!content.title && !content.eyebrow && !content.description) return null;
  return <div className={`section-heading ${light ? 'light' : ''}`}>
    {content.eyebrow && <span className="eyebrow"><i />{content.eyebrow}</span>}
    {content.title && <h2><AccentTitle text={content.title} accent={content.title_accent} /></h2>}
    {content.description && <p>{content.description}</p>}
  </div>;
}
export function ButtonLink({ button, context, index = 0, className = '' }: { button: ButtonData; context: SiteContext; index?: number; className?: string }) {
  const href = siteHref(button.url, context);
  if (!href || !button.label) return null;
  return <Link href={href} className={`button button-${button.variant || (index === 0 ? 'primary' : 'outline')} ${className}`}>
    <span>{button.label}</span><Icon name={index === 0 ? 'arrow' : 'left'} size={18} />
  </Link>;
}
export function Buttons({ buttons, context, className = '' }: { buttons?: ButtonData[]; context: SiteContext; className?: string }) {
  if (!buttons?.length) return null;
  return <div className={`button-row ${className}`}>{buttons.map((button, index) => <ButtonLink key={index} button={button} context={context} index={index} />)}</div>;
}
