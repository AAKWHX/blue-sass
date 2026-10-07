import {notFound} from "next/navigation";
import {isLocale,locales} from "@/lib/i18n/config";
import {serviceTemplates} from "@/lib/service-templates";
import {InteractiveTemplate} from "@/components/public/interactive-template";
export const metadata={title:"Blue Sass — Interactive website preview",robots:{index:false,follow:true}};
export function generateStaticParams(){return locales.flatMap(locale=>serviceTemplates(locale).map(template=>({locale,template:template.id})));}
export default async function Page({params}:{params:Promise<{locale:string;template:string}>}){const {locale,template}=await params;if(!isLocale(locale)||!serviceTemplates(locale).some(row=>row.id===template))notFound();return <InteractiveTemplate locale={locale} id={template}/>;}
