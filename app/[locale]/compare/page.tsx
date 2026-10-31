import {notFound} from 'next/navigation';
import {isLocale} from '@/lib/i18n/config';
import {ComparisonBrowser} from '@/components/public/discovery-browser';
import {pageMetadata} from '@/lib/page-metadata';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return pageMetadata(locale,'/compare',locale==='ar'?'مقارنات الأدوات | Blue Sass':locale==='nl'?'Tools vergelijken | Blue Sass':'Compare tools | Blue Sass',locale==='ar'?'قارن 24 خدمة حسب الميزات والاستخدام وأساس السعر.':locale==='nl'?'Vergelijk 24 diensten op mogelijkheden, gebruik en prijsbasis.':'Compare 24 services by capabilities, use cases and billing basis.');}
export default async function ComparePage({params}:{params:Promise<{locale:string}>}){const{locale}=await params;if(!isLocale(locale))notFound();return <ComparisonBrowser locale={locale}/>;}
