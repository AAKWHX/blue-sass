import {requirePermission} from "@/lib/db/access";
import {portfolioEntries} from "@/lib/db/portfolio";
import {PortfolioEditor} from "@/components/admin/portfolio-editor";
export default async function Page(){await requirePermission("portfolio.manage");return <PortfolioEditor entries={await portfolioEntries(true)}/>;}
