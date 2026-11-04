import type { CSSProperties } from 'react';
import type { SiteData } from '@/lib/types';
import { validColor } from '@/lib/links';
import { Header, Footer } from './shell';
import { SectionRenderer } from './sections';
import { ExperienceEffects } from './experience-effects';
import { VisitTracker } from './visit-tracker';

export function Website({ site }: { site: SiteData }) {
  const theme = site.settings.theme;
  const font = theme?.font_family;
  const primary = validColor(theme?.primary_color) || '#e60046';
  const rgb = [1, 3, 5].map(index => parseInt(primary.slice(index, index + 2), 16) / 255).map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
  const luminance = rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
  const styles = {
    '--primary': validColor(theme?.primary_color), '--secondary': validColor(theme?.secondary_color),
    '--page-background': validColor(theme?.background_color) || (theme?.mode === 'dark' ? '#141416' : undefined), '--ink': validColor(theme?.text_color) || (theme?.mode === 'dark' ? '#f1f1f3' : undefined),
    '--on-primary': luminance > .179 ? '#171719' : '#ffffff',
    '--site-font': font === 'Cairo' ? 'Cairo, var(--font-arabic)' : font === 'Tajawal' ? 'Tajawal, var(--font-arabic)' : font === 'Inter' ? 'Inter, var(--font-latin)' : site.context.locale === 'en' ? 'var(--font-latin)' : 'var(--font-arabic)',
  } as CSSProperties;
  return <div id="top" className="website" data-site-theme={theme?.mode === 'dark' ? 'dark' : 'light'} lang={site.context.locale} dir={site.settings.brand?.direction === 'ltr' ? 'ltr' : 'rtl'} style={styles}>
    <a className="skip-link" href="#main-content">{site.settings.interface?.skip_link}</a>
    <ExperienceEffects />
    {!site.context.preview && <VisitTracker locale={site.context.locale} />}
    <Header settings={site.settings} context={site.context} />
    <main id="main-content">{!site.page.sections.some(section => section.type === 'hero') && <h1 className="visually-hidden">{site.page.title}</h1>}{site.page.sections.map((section, index) => section.is_visible === false ? null : <SectionRenderer key={`${section.type}-${index}`} section={section} index={index} site={site} />)}</main>
    <Footer settings={site.settings} context={site.context} />
    {site.context.preview && site.settings.interface?.preview_label && <div className="draft-indicator"><i />{site.settings.interface.preview_label}</div>}
  </div>;
}
