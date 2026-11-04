"use client";
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
const copy = {
 ar: {title:'هذه الصفحة غير متاحة',body:'قد يكون الرابط قديمًا أو أُزيلت الصفحة. يمكنك العودة إلى الرئيسية أو استعراض خدماتنا.',home:'الرئيسية',services:'الخدمات'},
 en: {title:'This page is not available',body:'The link may be outdated or the page has been removed. Return home or explore our services.',home:'Home',services:'Services'},
 nl: {title:'Deze pagina is niet beschikbaar',body:'De link kan verouderd zijn of de pagina is verwijderd. Ga naar de homepage of bekijk onze diensten.',home:'Home',services:'Diensten'},
};
export default function NotFound(){
 const params=useParams();const locale=params.locale==='ar'?'ar':params.locale==='nl'?'nl':'en';const c=copy[locale];
 return <section className="container-x min-h-[60vh] py-32" dir={locale==='ar'?'rtl':'ltr'}><div className="mx-auto max-w-2xl"><p className="mono-label">404</p><h1 className="mt-5 text-3xl font-semibold">{c.title}</h1><p className="mt-5 leading-8">{c.body}</p><div className="mt-8 flex flex-wrap gap-4"><Button asChild variant="neon"><Link href={`/${locale}`}>{c.home}</Link></Button><Button asChild variant="outline"><Link href={`/${locale}/services`}>{c.services}</Link></Button></div></div></section>;
}
