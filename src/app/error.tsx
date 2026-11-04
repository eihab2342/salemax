'use client';
import { useSearchParams } from 'next/navigation';
export default function Error({ reset }: { reset: () => void }) {
  const query = useSearchParams();
  const english = query.get('lang') === 'en' || query.get('locale') === 'en';
  return <main className="system-page"><span className="system-number">↻</span><h1>{english ? 'Unable to load this page' : 'تعذر تحميل الصفحة'}</h1><p>{english ? 'Please try again in a moment.' : 'حاول مرة أخرى بعد قليل.'}</p><button onClick={reset} className="button button-primary">{english ? 'Try again' : 'إعادة المحاولة'}</button></main>;
}
