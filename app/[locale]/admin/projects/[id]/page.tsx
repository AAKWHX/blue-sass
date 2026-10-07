import {notFound} from "next/navigation";
import {z} from "zod";
import {requireViewer,hasCapability,AuthorisationError} from "@/lib/db/access";
import {getProjectDetail} from "@/lib/db/queries";
import {ProjectStatusPanel} from "@/components/admin/project-status-panel";
export default async function Page({params}:{params:Promise<{locale:string;id:string}>}){const viewer=await requireViewer();if(!["projects.stage","billing.approve","projects.assign","projects.read_assigned","projects.read_all"].some(capability=>hasCapability(viewer,capability as Parameters<typeof hasCapability>[1])))throw new AuthorisationError();const {locale,id}=await params;if(!z.string().uuid().safeParse(id).success)notFound();const detail=await getProjectDetail(id);if(!detail||detail.project.industry==="commerce")notFound();return <ProjectStatusPanel projects={[detail.project]} locale={locale} canApprove={hasCapability(viewer,"billing.approve")} canStage={hasCapability(viewer,"projects.stage")} detailed/>;}
