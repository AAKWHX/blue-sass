import Link from "next/link";
import {getViewer,hasCapability} from "@/lib/db/access";
import {listLeads,listViewerProjects} from "@/lib/db/queries";
import {isLocale} from "@/lib/i18n/config";
import {notFound} from "next/navigation";
import {toolsUi} from "@/lib/i18n/tools-ui";
import {platformCopy} from "@/lib/i18n/platform-tools";
import {messageToolCopy} from "@/lib/i18n/message-tool";
export const metadata={title:"Administration — Blue Sass",robots:{index:false,follow:false}};
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();const viewer=await getViewer();if(!viewer)return null;const [leads,projects]=await Promise.all([listLeads(),listViewerProjects()]);const c=toolsUi(locale);const p=platformCopy(locale);
 return <div className="container-x py-12"><h1 className="text-3xl font-semibold">{p.admin}</h1><div className="mt-8 grid gap-5 md:grid-cols-2">{[{path:"quotes",title:messageToolCopy(locale).quote,count:leads.length,show:hasCapability(viewer,"leads.read")||hasCapability(viewer,"leads.manage")},{path:"projects",title:p.project,count:projects.length,show:hasCapability(viewer,"projects.stage")||hasCapability(viewer,"billing.approve")||hasCapability(viewer,"projects.assign")}].filter(row=>row.show).map(row=><Link key={row.path} href={`/${locale}/admin/${row.path}`} className="tool-card rounded-2xl border p-7 transition-colors hover:border-white/50"><h2 className="text-xl font-semibold">{row.title}</h2><p className="mt-5 text-4xl">{row.count}</p><p className="mt-5 text-sm">{c.open}</p></Link>)}</div></div>;}
