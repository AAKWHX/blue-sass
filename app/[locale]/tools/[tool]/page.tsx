import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {isLocale,locales} from "@/lib/i18n/config";
import {toolCatalog,toolIds,isToolId} from "@/lib/tools/catalog";
import {toolsUi} from "@/lib/i18n/tools-ui";
import {QrTool} from "@/components/public/qr-tool";
import {InvoiceTool} from "@/components/public/invoice-tool";
import {PublicScanTool} from "@/components/public/public-scan-tool";
import {CostTool} from "@/components/public/cost-tool";
import {AiTool} from "@/components/public/ai-tool";
import {getViewer} from "@/lib/db/access";
import {aiAvailable} from "@/lib/tools/ai-config";
export function generateStaticParams(){return locales.flatMap(locale=>toolIds.filter(id=>id!=="message-checker").map(tool=>({locale,tool})));}
export async function generateMetadata({params}:{params:Promise<{locale:string;tool:string}>}):Promise<Metadata>{const {locale,tool}=await params;if(!isLocale(locale)||!isToolId(tool))return{};const c=toolCatalog(locale).find(row=>row.id===tool)!;const path=`/${locale}/tools/${tool}`;return {title:`${c.title} | Blue Sass`,description:`${toolsUi(locale).heading}: ${c.title}`,alternates:{canonical:path,languages:Object.fromEntries(locales.map(value=>[value,`/${value}/tools/${tool}`]))},openGraph:{title:c.title,url:path}};}
export default async function ToolPage({params}:{params:Promise<{locale:string;tool:string}>}){
 const {locale,tool}=await params;if(!isLocale(locale)||!isToolId(tool))notFound();const c=toolCatalog(locale).find(row=>row.id===tool)!;
 let content;if(tool==="qr-code-generator")content=<QrTool locale={locale}/>;else if(tool==="invoice-generator")content=<InvoiceTool locale={locale}/>;else if(tool==="website-cost-calculator")content=<CostTool/>;else if(c.ai)content=<AiTool locale={locale} tool={tool} available={aiAvailable()} signedIn={Boolean(await getViewer())}/>;else content=<PublicScanTool locale={locale} tool={tool}/>;
 return <div className="tool-surface py-12 sm:py-20"><div className="container-x max-w-5xl"><Link href={`/${locale}/tools`} className="text-sm underline underline-offset-4">{toolsUi(locale).back}</Link><h1 className="mb-9 mt-5 text-3xl font-semibold leading-tight sm:text-5xl">{c.title}</h1>{content}</div></div>;
}
