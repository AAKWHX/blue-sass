import {requireViewer,hasCapability,AuthorisationError} from "@/lib/db/access";
import {listLeads} from "@/lib/db/queries";
import {LeadsPanel} from "@/components/admin/leads-panel";
export default async function Page({params}:{params:Promise<{locale:string}>}){const viewer=await requireViewer();if(!hasCapability(viewer,"leads.read")&&!hasCapability(viewer,"leads.manage"))throw new AuthorisationError();const {locale}=await params;return <LeadsPanel locale={locale} leads={await listLeads()} readOnly={!hasCapability(viewer,"leads.manage")}/>;}
