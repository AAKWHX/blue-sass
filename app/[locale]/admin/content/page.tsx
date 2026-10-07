import {requirePermission} from "@/lib/db/access";
import {SiteContentEditor} from "@/components/admin/site-content-editor";
import {publicMetrics} from "@/lib/db/site-content";
export default async function Page(){await requirePermission("cms.manage");return <section className="container-x py-12"><SiteContentEditor initial={await publicMetrics()}/></section>;}
