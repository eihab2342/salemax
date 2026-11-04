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
  const styles = {
    '--primary': validColor(theme?.primary_color), '--secondary': validColor(theme?.secondary_color),
    '--page-background': validColor(theme?.background_color), '--ink': validColor(theme?.text_color),
    '--site-font': font === 'Cairo' ? 'Cairo, var(--font-arabic)' : font === 'Tajawal' ? 'Tajawal, var(--font-arabic)' : font === 'Inter' ? 'Inter, var(--font-latin)' : 'var(--font-arabic)',
  } as CSSProperties;
  return <div id="top" className="website" lang={site.context.locale} dir={site.settings.brand?.direction === 'ltr' ? 'ltr' : 'rtl'} style={styles}>
    <a className="skip-link" href="#main-content">{site.settings.interface?.skip_link}</a>
    <ExperienceEffects />
    {!site.context.preview && <VisitTracker locale={site.context.locale} />}
    <Header settings={site.settings} context={site.context} />
    <main id="main-content">{!site.page.sections.some(section => section.type === 'hero') && <h1 className="visually-hidden">{site.page.title}</h1>}{site.page.sections.map((section, index) => <SectionRenderer key={`${section.type}-${index}`} section={section} index={index} site={site} />)}</main>
    <Footer settings={site.settings} context={site.context} />
    {site.context.preview && site.settings.interface?.preview_label && <div className="draft-indicator"><i />{site.settings.interface.preview_label}</div>}
  </div>;
}
