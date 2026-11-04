import type { Metadata } from 'next';
import { headers } from 'next/headers';
import '@fontsource/ibm-plex-sans-arabic/400.css';
import '@fontsource/ibm-plex-sans-arabic/500.css';
import '@fontsource/ibm-plex-sans-arabic/600.css';
import '@fontsource/ibm-plex-sans-arabic/700.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import '@fontsource/manrope/800.css';
import '@fontsource/cairo/400.css';
import '@fontsource/cairo/500.css';
import '@fontsource/cairo/600.css';
import '@fontsource/tajawal/400.css';
import '@fontsource/tajawal/500.css';
import '@fontsource/tajawal/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import './globals.css';
import '../styles/editorial.css';
import '../styles/site-appearance.css';
import '../styles/section-variants.css';
import '../styles/brand-identity.css';
import '../styles/bilingual.css';
import '../styles/motion.css';
import '../styles/motion-controls.css';
import '../styles/navigation.css';
import '../styles/hero-canvas.css';
import '../styles/card-collection.css';
import '../styles/scrollbars.css';

export const metadata: Metadata = { applicationName: 'Salemax', formatDetection: { telephone: false } };
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = (await headers()).get('x-site-locale') === 'en' ? 'en' : 'ar';
  return <html lang={locale} dir={locale === 'en' ? 'ltr' : 'rtl'}><body>{children}</body></html>;
}
