'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { siteHref, safeUrl } from '@/lib/links';
import type { Settings, SiteContext } from '@/lib/types';
import { BrandMark, ButtonLink } from './ui';
import { Icon } from './icon';

export function Header({ settings, context }: { settings: Settings; context: SiteContext }) {
  const [open, setOpen] = useState(false);
  const items = settings.navigation?.items || [];
  const labels = settings.interface || {};
  const pathname = usePathname();
  const language = context.locale === 'ar' ? 'en' : 'ar';
  // Preview signatures are locale-specific and must never be reused across languages.
  const languagePath = pathname.replace(/^\/preview\/?/, '/');
  const languageHref = (languagePath === '/home' ? '/' : languagePath) + (language === 'en' ? '?lang=en' : '');
  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', escape); return () => window.removeEventListener('keydown', escape);
  }, []);
  return <header className="site-header"><div className="container header-inner">
    <Link className="brand" href={siteHref('/', context) || '/'} onClick={() => setOpen(false)}>
      {settings.brand?.logo && safeUrl(settings.brand.logo) ? <img src={settings.brand.logo} alt={settings.brand.name || ''} className="brand-logo" /> : <><BrandMark /><span>{settings.brand?.name}</span></>}
    </Link>
    <nav className="desktop-nav" aria-label={labels.menu_label}>
      {items.map((item, index) => item.children?.length ? <details className="nav-dropdown" name="site-navigation" key={index}>
        <summary>{item.label}<Icon name="down" size={12} /></summary>
        <div className="nav-dropdown-content">
          <Link href={siteHref(item.url, context) || '#'} className="dropdown-parent" onClick={event => event.currentTarget.closest('details')?.removeAttribute('open')}>{item.label}<Icon name="arrow" size={18} /></Link>
          {item.children.map((child, i) => <Link href={siteHref(child.url, context) || '#'} key={i} onClick={event => event.currentTarget.closest('details')?.removeAttribute('open')}><span className="dropdown-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><span>{child.label}</span>{child.description && <small>{child.description}</small>}<Icon name="arrow" size={17} /></Link>)}
        </div>
      </details> : <Link href={siteHref(item.url, context) || '#'} key={index}>{item.label}</Link>)}
    </nav>
    <div className="header-actions">
      <Link href={languageHref} className="site-language-toggle" lang={language} hrefLang={language} aria-label={language === 'en' ? 'Switch to English' : 'التبديل إلى العربية'}><Icon name="globe" size={16} /><span>{language === 'en' ? 'English' : 'العربية'}</span></Link>
      {settings.contact?.login_url && <Link href={safeUrl(settings.contact.login_url) || '#'} className="login-link"><Icon name="external" size={15} />{settings.brand?.name}</Link>}
      {settings.navigation?.buttons?.[0] && <ButtonLink button={settings.navigation.buttons[0]} context={context} className="header-cta" />}
      <button className="menu-toggle" aria-label={open ? labels.close_label : labels.menu_label} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}><Icon name={open ? 'close' : 'menu'} size={24} /></button>
    </div>
    <nav id="mobile-navigation" className="mobile-nav" hidden={!open} aria-label={labels.menu_label}>
      {items.map((item, index) => <div key={index}>
        <Link href={siteHref(item.url, context) || '#'} onClick={() => setOpen(false)}>{item.label}<Icon name="arrow" size={17} /></Link>
        {item.children?.map((child, i) => <Link className="mobile-child" href={siteHref(child.url, context) || '#'} key={i} onClick={() => setOpen(false)}>{child.label}</Link>)}
      </div>)}
      {settings.navigation?.buttons?.map((button, index) => <div key={index} onClick={() => setOpen(false)}><ButtonLink button={button} context={context} /></div>)}
    </nav>
  </div></header>;
}

export function Footer({ settings, context }: { settings: Settings; context: SiteContext }) {
  return <footer className="site-footer"><div className="container">
    <div className="footer-main"><div className="footer-brand-block">
      <Link className="brand" href={siteHref('/', context) || '/'}>{settings.brand?.logo && safeUrl(settings.brand.logo) ? <img src={settings.brand.logo} alt={settings.brand.name || ''} className="brand-logo" /> : <><BrandMark /><span>{settings.brand?.name}</span></>}</Link>
      {settings.footer?.description && <p>{settings.footer.description}</p>}
      {settings.brand?.tagline && <span className="footer-tagline"><i />{settings.brand.tagline}</span>}
    </div>
      <div className="footer-columns">{settings.footer?.columns?.map((column, index) => <div key={index}><h3>{column.title}</h3>{column.links?.map((link, i) => <Link href={siteHref(link.url, context) || '#'} key={i}>{link.label}</Link>)}</div>)}</div>
    </div>
    {settings.brand?.name && <div className="footer-signature" aria-hidden="true"><span>{settings.brand.name}</span><Icon name="arrow" size={90} /></div>}
    <div className="footer-bottom"><span>{settings.footer?.copyright}</span>
      <div className="social-links">{settings.social?.items?.map((item, index) => <Link key={index} href={safeUrl(item.url) || '#'} aria-label={item.label || undefined}><Icon name={item.icon || 'globe'} size={18} /><span>{item.label}</span></Link>)}</div>
      <a href="#top" className="back-top">{settings.interface?.back_to_top}<Icon name="arrow" size={16} /></a>
    </div>
  </div></footer>;
}
