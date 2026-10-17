import {notFound} from 'next/navigation';
import {isLocale} from '@/lib/i18n/config';
import {DiscoveryBrowser} from '@/components/public/discovery-browser';
import {pageMetadata} from '@/lib/page-metadata';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}){const {locale}=await params;return pageMetadata(locale,'/discover',locale==='ar'?'اكتشف الويب | Blue Sass':locale==='nl'?'Ontdek het web | Blue Sass':'Discover the web | Blue Sass',locale==='ar'?'عشرة مسارات لاكتشاف مواقع وتجارب وأدوات مختارة.':locale==='nl'?'Tien routes langs websites, ervaringen en tools.':'Ten paths through selected websites, experiences and tools.');}
export default async function DiscoverPage({params}:{params:Promise<{locale:string}>}){const{locale}=await params;if(!isLocale(locale))notFound();return <DiscoveryBrowser locale={locale}/>;}
