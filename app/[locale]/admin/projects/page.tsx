import {requireViewer,hasCapability,AuthorisationError} from "@/lib/db/access";
import {listViewerProjects} from "@/lib/db/queries";
import {toolOrderIds} from "@/lib/db/tool-subscriptions";
import {commerceProjectIds} from "@/lib/db/marketplace";
import {assignmentDirectory} from "@/lib/db/staff";
import {ProjectAssignmentForm} from "@/components/admin/staff-forms";
import {ProjectStatusPanel} from "@/components/admin/project-status-panel";
export default async function Page({params}:{params:Promise<{locale:string}>}){const viewer=await requireViewer();if(!hasCapability(viewer,"projects.stage")&&!hasCapability(viewer,"billing.approve")&&!hasCapability(viewer,"projects.assign")&&!hasCapability(viewer,"projects.read_assigned")&&!hasCapability(viewer,"projects.read_all"))throw new AuthorisationError();const {locale}=await params;const projects=await listViewerProjects();const [tools,commerce,assignment]=await Promise.all([toolOrderIds(projects.map(p=>p.id)),commerceProjectIds(projects.map(p=>p.id)),hasCapability(viewer,"projects.assign")?assignmentDirectory():null]);const excluded=new Set([...tools,...commerce.map(p=>p.id)]);
 return <>{assignment&&<section className="container-x py-7"><ProjectAssignmentForm {...assignment}/></section>}<ProjectStatusPanel projects={projects.filter(p=>!excluded.has(p.id))} locale={locale} canApprove={hasCapability(viewer,"billing.approve")} canStage={hasCapability(viewer,"projects.stage")}/></>;}
