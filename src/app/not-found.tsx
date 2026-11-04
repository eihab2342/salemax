import Link from 'next/link';
export default function NotFound() {
  return <main className="system-page"><span className="system-number">404</span><h1>الصفحة غير موجودة</h1><p>الرابط غير متاح أو الصفحة لم تُنشر بعد.</p><Link href="/" className="button button-primary">العودة للرئيسية</Link></main>;
}
