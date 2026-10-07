import Link from "next/link";
import {redirect,notFound} from "next/navigation";
import {getViewer,canOpenAdmin,hasCapability} from "@/lib/db/access";
import {isLocale} from "@/lib/i18n/config";
import {toolsUi} from "@/lib/i18n/tools-ui";
import {businessUi} from "@/lib/i18n/business-ui";
import {platformCopy} from "@/lib/i18n/platform-tools";
import {messageToolCopy} from "@/lib/i18n/message-tool";
import {Button} from "@/components/ui/button";
export default async function Layout({params,children}:{params:Promise<{locale:string}>;children:React.ReactNode}){const {locale}=await params;if(!isLocale(locale))notFound();const viewer=await getViewer();if(!viewer)redirect(`/${locale}/login`);if(!canOpenAdmin(viewer))redirect(`/${locale}/portal`);const c=toolsUi(locale);const p=platformCopy(locale);
 const links=[{path:"",title:p.admin,show:true},{path:"quotes",title:messageToolCopy(locale).quote,show:hasCapability(viewer,"leads.read")||hasCapability(viewer,"leads.manage")},{path:"projects",title:p.project,show:hasCapability(viewer,"projects.stage")||hasCapability(viewer,"billing.approve")||hasCapability(viewer,"projects.assign")||hasCapability(viewer,"projects.read_assigned")||hasCapability(viewer,"projects.read_all")},{path:"portfolio",title:c.preview,show:hasCapability(viewer,"portfolio.manage")},{path:"content",title:c.data,show:hasCapability(viewer,"cms.manage")},{path:"team",title:p.team,show:viewer.isOwner},{path:"reviews",title:c.report,show:hasCapability(viewer,"reviews.manage")},{path:"marketplace",title:businessUi(locale).moderate,show:hasCapability(viewer,"marketplace.manage")}];
 return <div className="tool-surface min-h-[70vh]"><nav className="container-x grid gap-2 pt-7 sm:grid-cols-2 lg:grid-cols-4" aria-label={p.admin}>{links.filter(link=>link.show).map(link=><Button asChild key={link.path} variant="outline"><Link href={`/${locale}/admin${link.path?`/${link.path}`:""}`}>{link.title}</Link></Button>)}</nav>{children}</div>;}
