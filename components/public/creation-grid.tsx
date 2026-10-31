import Link from "next/link";
import { ArrowUpRight, Globe, Smartphone, Monitor, ShoppingBag, Layers3, Workflow, PenTool } from "lucide-react";
import { serviceCatalog } from "@/lib/service-catalog";
import { creationCopy, creationService } from "@/lib/i18n/creation";
import type { Locale } from "@/lib/i18n/config";
import { ServiceImage } from './service-image';

const icons = [Globe, Smartphone, Smartphone, Monitor, ShoppingBag, Layers3, Workflow, PenTool];
export function CreationGrid({ locale, all = false }: { locale: Locale; all?: boolean }) {
  const c = creationCopy(locale); const Heading = all ? "h1" : "h2"; const CardHeading = all ? "h2" : "h3";
  return <section id="studio-services" className="creation-section container-x">
    <div className="creation-section-heading"><div><Heading>{c.heading}</Heading><p>{c.intro}</p></div>{!all && <Link className="creation-text-link" href={`/${locale}/services`}>{c.all}<ArrowUpRight aria-hidden className="flip-x" size={18}/></Link>}</div>
    <div className="bs-track-viewport"><div className="creation-grid" data-cinematic-track>{serviceCatalog(locale).map((service, index) => {
      if (!all && ["ios", "windows"].includes(service.slug)) return null;
      const item = creationService(locale, index); const Icon = icons[index];
      return <article key={service.slug} className={`creation-card creation-card--${service.slug}`}>
        <ServiceImage service={service.slug}/>
        <div className="creation-card-head"><Icon aria-hidden size={27}/></div>
        <CardHeading><Link href={`/${locale}/services/${service.slug}`}>{item.title}<ArrowUpRight aria-hidden className="flip-x" size={22}/></Link></CardHeading>
        <p>{item.description}</p><ul>{service.features.slice(0, 3).map(feature => <li key={feature}>{feature}</li>)}</ul>
        <span className="creation-card-foot" aria-hidden>{c.explore}<span className="inline-block flip-x">↗</span></span>
      </article>;
    })}</div></div>
  </section>;
}
