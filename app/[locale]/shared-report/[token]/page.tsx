import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n/config";
import { platformCopy } from "@/lib/i18n/platform-tools";
import { sharedAudit } from "@/lib/db/audit-sharing";
import { AuditReportView } from "@/components/public/audit-report";
export const dynamic="force-dynamic";
export const metadata={title:"Blue Sass - Shared report",robots:{index:false,follow:false}};
export default async function SharedReport({params}:{params:Promise<{locale:string;token:string}>}){
  const {locale,token}=await params;if(!isLocale(locale))notFound();const row=await sharedAudit(token);const c=platformCopy(locale);
  return <div className="tool-surface audit-report py-12"><div className="container-x max-w-6xl">{row?.report?<><p className="mb-5 text-sm text-white/70" data-no-print>{c.sharing.shared}</p><AuditReportView id={row.id} report={row.report} canExport={false} previous={null} compareLinks={[]} shared/></>:<section className="rounded-2xl border border-white/20 p-8"><h1 className="text-2xl font-semibold">{c.sharing.expired}</h1></section>}</div></div>;
}
