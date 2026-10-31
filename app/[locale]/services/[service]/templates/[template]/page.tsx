import {notFound} from 'next/navigation';
import Link from 'next/link';
import {isLocale} from '@/lib/i18n/config';
import {findServiceTemplate} from '@/lib/service-templates';
import {TemplatePreview} from '@/components/public/template-preview';
export const metadata={robots:{index:false,follow:true}};
export default async function TemplatePage({params}:{params:Promise<{locale:string;service:string;template:string}>}){
 const {locale,service,template:id}=await params;if(!isLocale(locale))notFound();const template=findServiceTemplate(id,locale);if(!template||template.service!==service)notFound();
 return <section className="studio-section"><div className="container-x"><h1 className="studio-heading">{template.name}</h1><p className="studio-deck mt-6 mb-10">{locale==='ar'?'قالب أولي قابل للتخصيص. نحدد محتوى المشروع ووظائفه معك قبل التنفيذ.':locale==='nl'?'Een aanpasbaar startontwerp. Samen bepalen we inhoud en functies vóór de uitvoering.':'A customisable starting design. We define your project content and features together before implementation.'}</p><div className="aspect-[4/3] max-w-4xl"><TemplatePreview template={template} locale={locale}/></div><Link className="creation-text-link mt-8 inline-block" href={`/${locale}/services/${service}`}>{locale==='ar'?'تفاصيل الخدمة':locale==='nl'?'Bekijk de dienst':'Service details'}</Link></div></section>;
}
