'use client';
export default function Error({ reset }: { reset: () => void }) {
  return <main className="system-page"><span className="system-number">↻</span><h1>تعذر تحميل الصفحة</h1><p>حاول مرة أخرى بعد قليل.</p><button onClick={reset} className="button button-primary">إعادة المحاولة</button></main>;
}
