'use client';

import Link from 'next/link';
import { useEffect, useState, useId } from 'react';
import { usePathname } from 'next/navigation';
import { siteHref, safeUrl } from '@/lib/links';
import type { Settings, SiteContext, NavItem } from '@/lib/types';
import { BrandMark, ButtonLink } from './ui';
import { Icon } from './icon';
import { VisitorThemeToggle } from './visitor-theme';

function RichLink({ item, context }: { item: NavItem; context: SiteContext }) {
  const href = siteHref(item.url, context);
  if (item.hidden || !href) return null;
  return <Link className="rich-nav-link" href={href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noopener noreferrer' : undefined}>
    {item.icon && <span className="nav-link-icon"><Icon name={item.icon} /></span>}
    <span><strong>{item.label}</strong>{item.description && <small>{item.description}</small>}</span>{item.external && <Icon name="external" size={14} />}
  </Link>;
}

function MenuPanel({ item, context }: { item: NavItem; context: SiteContext }) {
  const groups = item.groups?.filter(group => !group.hidden) || [];
  const [active, setActive] = useState(0);
  const id = useId();
  const selected = Math.min(active, Math.max(0, groups.length - 1));
  const promo = !item.hide_promo && (item.promo_title || item.promo_image);
  return <div className={`nav-panel ${promo ? 'with-promo' : ''}`}>
    <div className="nav-panel-links">
      {groups.length > 0 && <div className="nav-tabs" role="tablist" aria-label={item.label || ''}>{groups.map((group, index) => <button key={index} id={`${id}-tab-${index}`} type="button" role="tab" aria-selected={selected === index} aria-controls={`${id}-panel`} tabIndex={selected === index ? 0 : -1} onClick={() => setActive(index)} onKeyDown={event => { if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? 0 : event.key === 'End' ? groups.length - 1 : (selected + (event.key === 'ArrowRight' ? 1 : -1) + groups.length) % groups.length; setActive(next); document.getElementById(`${id}-tab-${next}`)?.focus(); } }}>{group.label}</button>)}</div>}
      <div id={`${id}-panel`} role={groups.length ? 'tabpanel' : undefined} aria-labelledby={groups.length ? `${id}-tab-${selected}` : undefined}>
        {(groups.length ? groups[selected].items : item.children)?.map((link, index) => <RichLink key={index} item={link} context={context} />)}
      </div>
    </div>
    {promo && <aside className="nav-promo"><h3>{item.promo_title}</h3><p>{item.promo_description}</p>{safeUrl(item.promo_image) && <img src={item.promo_image} alt="" />}{item.promo_label && siteHref(item.promo_url, context) && <Link className="button button-primary" href={siteHref(item.promo_url, context)!}>{item.promo_label}<Icon name="arrow" /></Link>}</aside>}
  </div>;
}

export function Header({ settings, context }: { settings: Settings; context: SiteContext }) {
  const [open, setOpen] = useState(false);
  const items = (settings.navigation?.items || []).filter(item => !item.hidden);
  const labels = settings.interface || {};
  const pathname = usePathname();
  const language = context.locale === 'ar' ? 'en' : 'ar';
  // Preview signatures are locale-specific and must never be reused across languages.
  const languagePath = pathname.replace(/^\/preview\/?/, '/');
  const languageHref = (languagePath === '/home' ? '/' : languagePath) + (language === 'en' ? '?lang=en' : '');
  useEffect(() => {
    const close = () => document.querySelectorAll<HTMLDetailsElement>('.nav-dropdown[open]').forEach(node => { node.open = false; });
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); close(); } };
    const outside = (event: MouseEvent) => { if (!(event.target as Element).closest('.nav-dropdown')) close(); };
    window.addEventListener('keydown', escape); document.addEventListener('click', outside); return () => { window.removeEventListener('keydown', escape); document.removeEventListener('click', outside); };
  }, []);
  return <header className="site-header" onClick={event => { if ((event.target as Element).closest('a')) { setOpen(false); event.currentTarget.querySelectorAll<HTMLDetailsElement>('details[open]').forEach(node => { node.open = false; }); } }}><div className="container header-inner">
    <Link className="brand" href={siteHref('/', context) || '/'} onClick={() => setOpen(false)}>
      {settings.brand?.logo && safeUrl(settings.brand.logo) ? <img src={settings.brand.logo} alt={settings.brand.name || ''} className="brand-logo" /> : <><BrandMark /><span>{settings.brand?.name}</span></>}
    </Link>
    <nav className="desktop-nav" aria-label={labels.menu_label}>
      {items.map((item, index) => item.children?.some(child => !child.hidden) || item.groups?.some(group => !group.hidden) ? <details className="nav-dropdown" name="site-navigation" key={index}>
        <summary>{item.label}<Icon name="down" size={12} /></summary>
        <MenuPanel item={item} context={context} />
      </details> : <RichLink item={item} context={context} key={index} />)}
    </nav>
    <div className="header-actions">
      <Link href={languageHref} className="site-language-toggle" lang={language} hrefLang={language} aria-label={language === 'en' ? 'Switch to English' : 'التبديل إلى العربية'}><Icon name="globe" size={16} /><span>{language === 'en' ? 'English' : 'العربية'}</span></Link>
      {settings.utilities?.show_call && settings.contact?.phone && <a className="utility-call" href={`tel:${settings.contact.phone.replace(/[^+\d]/g, '')}`}><Icon name="phone" size={18} />{settings.utilities.call_label || settings.contact.phone}</a>}
      {settings.utilities?.show_login !== false && settings.contact?.login_url && <Link href={safeUrl(settings.contact.login_url) || '#'} className="login-link"><Icon name="external" size={15} />{settings.utilities?.login_label || settings.brand?.name}</Link>}
      {settings.utilities?.show_booking && siteHref(settings.contact?.booking_url, context) && <Link className="button button-primary booking-link" href={siteHref(settings.contact?.booking_url, context)!}><Icon name="calendar" size={18} />{settings.utilities.booking_label}</Link>}
      {settings.navigation?.buttons?.[0] && <ButtonLink button={settings.navigation.buttons[0]} context={context} className="header-cta" />}
      <button className="menu-toggle" aria-label={open ? labels.close_label : labels.menu_label} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}><Icon name={open ? 'close' : 'menu'} size={24} /></button>
    </div>
    <nav id="mobile-navigation" className="mobile-nav" hidden={!open} aria-label={labels.menu_label}>
      {items.map((item, index) => <div key={index}>
        <Link href={siteHref(item.url, context) || '#'} onClick={() => setOpen(false)}>{item.label}<Icon name="arrow" size={17} /></Link>
        {(item.children?.length || item.groups?.length) ? <MenuPanel item={item} context={context} /> : null}
      </div>)}
      {settings.navigation?.buttons?.map((button, index) => <div key={index} onClick={() => setOpen(false)}><ButtonLink button={button} context={context} /></div>)}
    </nav>
  </div></header>;
}

export function Footer({ settings, context }: { settings: Settings; context: SiteContext }) {
  return <footer className={`site-footer footer-${settings.footer?.layout || 'classic'}`}><div className="container">
    {settings.footer?.title && <h2 className="footer-directory-title">{settings.footer.title}</h2>}
    <div className="footer-main"><div className="footer-brand-block">
      <Link className="brand" href={siteHref('/', context) || '/'}>{settings.brand?.logo && safeUrl(settings.brand.logo) ? <img src={settings.brand.logo} alt={settings.brand.name || ''} className="brand-logo" /> : <><BrandMark /><span>{settings.brand?.name}</span></>}</Link>
      {settings.footer?.description && <p>{settings.footer.description}</p>}
      {settings.brand?.tagline && <span className="footer-tagline"><i />{settings.brand.tagline}</span>}
    </div>
      <div className="footer-columns">{settings.footer?.columns?.filter(column => !column.hidden).map((column, index) => <div key={index}><h3>{column.title}</h3>{column.links?.map((link, i) => <RichLink item={link} context={context} key={i} />)}</div>)}</div>
    </div>
    {!settings.footer?.hide_wordmark && settings.brand?.name && <div className="footer-signature" aria-hidden="true"><span>{settings.brand.name}</span><Icon name="arrow" size={90} /></div>}
    <div className="footer-bottom"><span>{settings.footer?.copyright}</span>
      <VisitorThemeToggle settings={settings} preview={context.preview} />
      <div><span>{settings.footer?.social_title}</span><div className="social-links">{settings.social?.items?.filter(item => safeUrl(item.url)).map((item, index) => <Link key={index} href={safeUrl(item.url)!} aria-label={item.label || undefined}><Icon name={item.icon || 'globe'} size={18} /><span>{item.label}</span></Link>)}</div></div>
      <div className="footer-legal">{settings.footer?.legal_links?.map((item, index) => <RichLink key={index} item={item} context={context} />)}</div>
      <a href="#top" className="back-top">{settings.interface?.back_to_top}<Icon name="arrow" size={16} /></a>
    </div>
  </div>{settings.utilities?.show_whatsapp && safeUrl(settings.contact?.whatsapp_url) && <a className={`floating-contact floating-${settings.utilities.floating_position || 'right'}`} href={safeUrl(settings.contact?.whatsapp_url)!} target="_blank" rel="noopener noreferrer"><Icon name="messages" size={24} /><span>{settings.utilities.whatsapp_label || 'WhatsApp'}</span></a>}</footer>;
}
