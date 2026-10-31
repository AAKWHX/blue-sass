import Link from "next/link";
import { ArrowUpRight, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceImage } from './service-image';
import { serviceCatalog, serviceSlugs, type ServiceSlug } from "@/lib/service-catalog";
import { serviceDetails } from "@/lib/service-details";
import { creationCopy, creationLayouts, creationService } from "@/lib/i18n/creation";
import type { Locale } from "@/lib/i18n/config";

export function CreationDetail({ locale, service }: { locale: Locale; service: ServiceSlug }) {
  const index = serviceSlugs.indexOf(service); const item = serviceCatalog(locale)[index];
  const detail = creationService(locale, index); const labels = creationCopy(locale);
  const scope = serviceDetails(locale)[service]; const layout = creationLayouts[service];
  const href = `/${locale}/quote?type=${item.quoteType}&service=${service}`;
  return <div className={`creation-detail creation-detail--${service}`} data-service={service} data-layout={layout}>
    <div className="container-x">
      <Link href={`/${locale}/services`} className="creation-text-link creation-back"><span aria-hidden className="inline-block flip-x">←</span> {labels.all}</Link>
      <header className="creation-detail-hero"><div className="creation-detail-copy"><h1>{detail.title}</h1><p>{detail.description}</p><Button asChild variant="neon"><Link href={href}>{labels.start}<ArrowUpRight aria-hidden className="flip-x" size={19}/></Link></Button></div><div className="creation-detail-art"><ServiceImage service={service} alt={detail.title} priority/></div></header>
      <section className={`creation-focus creation-focus--${layout}`} aria-labelledby="service-focus"><div><h2 id="service-focus">{detail.focus}</h2><p>{scope.idealFor}</p></div>
        <ol className="creation-route">{detail.steps.map((step, i) => <li key={step}><span className="creation-step-number">0{i + 1}</span><h3>{step}</h3>{i < detail.steps.length - 1 && <ArrowRight aria-hidden className="creation-route-arrow" size={18}/>}</li>)}</ol>
      </section>
      <section className="creation-deliverables" aria-labelledby="service-deliverables"><div className="creation-deliverables-heading"><h2 id="service-deliverables">{detail.deliver}</h2><p>{scope.outcome}</p></div><div className="creation-benefits">{detail.benefits.map((benefit, i) => <article key={benefit}><span aria-hidden>{service === "design" ? ["Aa", "UI", "↗"][i] : <Check size={20}/>}</span><h3>{item.features[i]}</h3><p>{benefit}</p></article>)}</div></section>
      <aside className="creation-next"><div><h2>{labels.start}</h2><p>{labels.plan}</p></div><Button asChild variant="neon"><Link href={href}>{detail.title}<ArrowUpRight aria-hidden className="flip-x" size={20}/></Link></Button></aside>
    </div>
  </div>;
}
