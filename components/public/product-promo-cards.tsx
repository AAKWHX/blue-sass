import Link from "next/link";
import { Cloud, FileSearch, Layers3, Briefcase, ShoppingBag, Users, ArrowUpRight } from "lucide-react";
import { messageToolCopy } from "@/lib/i18n/message-tool";
import { businessUi } from "@/lib/i18n/business-ui";
import { subscriptionUnits, subscriptionHeading } from "@/lib/i18n/subscription-units";
import { PlatformCard } from "./platform-card";
import type { Locale } from "@/lib/i18n/config";
import { creationCopy } from "@/lib/i18n/creation";
import { homePlatformCopy } from "@/lib/i18n/home-platform";
import { Button } from "@/components/ui/button";

export function ProductPromoCards({ locale }: { locale: Locale }) {
  const b = businessUi(locale);
  const labels = creationCopy(locale); const content = homePlatformCopy(locale);
  const toolPaths = ["qr-code-generator", "invoice-generator", "seo-checker", "message-checker"];
  const cards = [
    { path: "subscriptions", title: subscriptionHeading(locale), icon: Layers3 },
    { path: "hosting", title: subscriptionUnits(locale).hosting, icon: Cloud },
    { path: "tools", title: messageToolCopy(locale).tools, icon: FileSearch },
    { path: "products", title: b.products, icon: ShoppingBag },
    { path: "marketplace", title: b.freelance, icon: Users },
    { path: "jobs", title: b.jobs, icon: Briefcase },
  ];
  return <div className="platform-section container-x"><div className="creation-section-heading"><div><h2>{labels.platform}</h2><p>{labels.platformIntro}</p></div></div><div className="platform-grid">
    {cards.map((card, index) => <PlatformCard key={card.path} index={index}>
      <section id={`home-${card.path}`} className={`platform-card platform-card-${card.path}`} aria-labelledby={`platform-${card.path}`}>
        <div className="platform-card-top"><span className="platform-icon"><card.icon aria-hidden="true" size={24}/></span><span className="platform-number" aria-hidden="true">0{index + 1}</span></div>
        <h3 id={`platform-${card.path}`}><Link href={`/${locale}/${card.path}`} className="platform-link">{card.title}<ArrowUpRight aria-hidden="true" size={22}/></Link></h3>
        <p>{content.details[index]}</p>
        {card.path === "tools" ? <><div className="platform-tool-grid">{content.tools.map((text, toolIndex) => { const [title, benefit] = text.split("|"); return <Link key={toolPaths[toolIndex]} href={`/${locale}/tools/${toolPaths[toolIndex]}`} className="platform-tool"><span className="platform-tool-title">{title}<ArrowUpRight aria-hidden size={17}/></span><span>{benefit}</span><span className="platform-tool-cta">{labels.openTool}</span></Link>; })}</div><p className="platform-tool-note">{content.note}</p></> : <><ul className="platform-benefit-list">{content.features[index].map(feature => <li key={feature}><span aria-hidden>✓</span>{feature}</li>)}</ul><Button asChild variant="ghostNeon" className="mt-7"><Link href={`/${locale}/${card.path}`}>{labels.explore}<ArrowUpRight aria-hidden size={17}/></Link></Button></>}
        <div className="platform-decoration" aria-hidden="true"><i/><i/><i/></div>
      </section>
    </PlatformCard>)}
  </div></div>;
}
