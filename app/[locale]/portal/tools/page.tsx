import Link from "next/link";
import {redirect,notFound} from "next/navigation";
import {getViewer} from "@/lib/db/access";
import {usageSummary} from "@/lib/db/tool-usage";
import {ownedReports} from "@/lib/db/audits";
import {isLocale} from "@/lib/i18n/config";
import {toolsUi} from "@/lib/i18n/tools-ui";
import {messageToolCopy} from "@/lib/i18n/message-tool";
import {Button} from "@/components/ui/button";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();const viewer=await getViewer();if(!viewer)redirect(`/${locale}/login`);const [usage,data]=await Promise.all([usageSummary(viewer.id),ownedReports()]);const c=toolsUi(locale);
 return <div className="tool-surface py-12"><div className="container-x max-w-5xl"><h1 className="text-3xl font-semibold">{messageToolCopy(locale).tools}</h1><div className="my-8 grid gap-5 sm:grid-cols-3">{[{label:c.status,value:usage.plan},{label:c.remaining,value:usage.remaining},{label:c.saved,value:data.reports.length}].map(row=><div className="tool-card rounded-xl border p-5" key={row.label}><p className="text-sm text-white/70">{row.label}</p><p className="mt-4 text-3xl font-semibold">{row.value}</p></div>)}</div><div className="grid gap-3 sm:grid-cols-2"><Button asChild variant="neon"><Link href={`/${locale}/tools`}>{c.open}</Link></Button><Button asChild variant="outline"><Link href={`/${locale}/subscriptions`}>{c.remaining} +</Link></Button></div><h2 className="mb-5 mt-10 text-2xl">{c.saved}</h2><ul className="space-y-3">{data.reports.slice(0,15).map(report=><li key={report.id}><Link href={`/${locale}/audit/${report.id}`} className="block rounded-xl border border-white/15 p-4"><span className="break-all">{report.target}</span><span className="mt-2 block text-xs">{report.createdAt.toISOString().slice(0,10)} · {report.status}</span></Link></li>)}</ul></div></div>;}
