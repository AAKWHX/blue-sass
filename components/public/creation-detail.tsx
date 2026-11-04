import Link from "next/link";
import { ArrowUpRight, Check, ArrowRight, Clock, Layers, Cpu, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceImage } from './service-image';
import { serviceCatalog, serviceSlugs, type ServiceSlug } from "@/lib/service-catalog";
import { serviceDetails, serviceExtendedContent, serviceQuotePresets, serviceSectionLabels } from "@/lib/service-details";
import { creationCopy, creationLayouts, creationService } from "@/lib/i18n/creation";
import { baseCost, featureCost, formatEUR, reservationDeposit } from "@/lib/pricing";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/config";

export function CreationDetail({ locale, service }: { locale: Locale; service: ServiceSlug }) {
  const index = serviceSlugs.indexOf(service); const item = serviceCatalog(locale)[index];
  const detail = creationService(locale, index); const labels = creationCopy(locale);
  const scope = serviceDetails(locale)[service]; const layout = creationLayouts[service];
  const ext = serviceExtendedContent(locale, service);
  const sec = serviceSectionLabels(locale);
  const preset = serviceQuotePresets[service];
  const base = baseCost[preset.type];
  const deposit = reservationDeposit[preset.type];
  const dict = getDictionary(locale);
  const href = `/${locale}/contact#inquiry`;
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ext.faqs.map(f => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return <div className={`creation-detail creation-detail--${service}`} data-service={service} data-layout={layout} data-ad-eligible-content="true">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />
    <div className="container-x">
      <Link href={`/${locale}/services`} className="creation-text-link creation-back">← {labels.all}</Link>
      <header className="creation-detail-hero"><div className="creation-detail-copy"><h1>{detail.title}</h1><p>{detail.description}</p><div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-white/80"><span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5"><Clock aria-hidden size={15}/>{sec.timelineTitle}: <strong>{scope.timeline}</strong></span><span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5">{sec.baseLabel}: <strong dir="ltr">{formatEUR(base.price, locale)}</strong></span></div><Button asChild variant="neon"><Link href={href}>{labels.start}<ArrowUpRight aria-hidden size={19}/></Link></Button></div><div className="creation-detail-art"><ServiceImage service={service} alt={detail.title} priority/></div></header>
      <section className="mt-12 grid gap-6 rounded-3xl border border-white/15 bg-[#101216]/90 p-6 text-white sm:p-10 lg:grid-cols-[1.2fr_.8fr]" aria-labelledby="service-overview-heading">
        <div>
          <h2 id="service-overview-heading" className="text-2xl font-bold text-white sm:text-3xl">{sec.overviewTitle}</h2>
          <p className="mt-4 text-base leading-8 text-white/75">{ext.overview}</p>
          <h3 className="mt-8 flex items-center gap-2 text-lg font-bold text-white"><Layers aria-hidden size={18}/>{sec.suitableTitle}</h3>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-white/75">{ext.audienceItems.map(aud => <li key={aud} className="flex items-start gap-2.5"><Check aria-hidden size={17} className="mt-1 shrink-0 text-neon-cyan"/><span>{aud}</span></li>)}</ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[.03] p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold text-white"><Cpu aria-hidden size={18}/>{sec.techTitle}</h3>
          <ul className="mt-4 space-y-2.5 text-sm leading-7 text-white/75">{ext.technologies.map(tech => <li key={tech} className="rounded-xl border border-white/10 bg-white/[.04] px-3.5 py-2">{tech}</li>)}</ul>
        </div>
      </section>
      <section className={`creation-focus creation-focus--${layout}`} aria-labelledby="service-focus"><div><h2 id="service-focus">{detail.focus}</h2><p>{scope.idealFor}</p></div>
        <ol className="creation-route">{detail.steps.map((step, i) => <li key={step}><span className="creation-step-number">0{i + 1}</span><div><h3>{step}</h3>{ext.processDetails[i] && <p className="mt-2 text-sm leading-6 text-white/70">{ext.processDetails[i]}</p>}</div>{i < detail.steps.length - 1 && <ArrowRight aria-hidden className="creation-route-arrow" size={18}/>}</li>)}</ol>
      </section>
      <section className="creation-deliverables" aria-labelledby="service-deliverables"><div className="creation-deliverables-heading"><h2 id="service-deliverables">{detail.deliver}</h2><p>{scope.outcome}</p></div><div className="creation-benefits">{detail.benefits.map((benefit, i) => <article key={benefit}><span aria-hidden>{service === "design" ? ["Aa", "UI", "↗"][i] : <Check size={20}/>}</span><h3>{item.features[i]}</h3><p>{benefit}</p></article>)}</div></section>
      <section className="mt-12 rounded-3xl border border-white/15 bg-[#101216]/90 p-6 text-white sm:p-10" aria-labelledby="service-pricing-heading">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <h2 id="service-pricing-heading" className="text-2xl font-bold text-white sm:text-3xl">{sec.pricingTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-white/70">{sec.pricingNote}</p>
            <div className="mt-6 rounded-2xl border border-white/15 bg-white/[.04] p-5">
              <p className="text-xs uppercase tracking-wider text-white/60">{sec.baseLabel}</p>
              <p className="mt-1 text-3xl font-bold text-white" dir="ltr">{formatEUR(base.price, locale)}</p>
              <p className="mt-2 text-sm text-white/70">{sec.timelineTitle}: <strong>{scope.timeline}</strong></p>
              <p className="mt-1 text-xs text-white/60">{sec.depositLabel}: <span dir="ltr">{formatEUR(deposit, locale)}</span></p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{sec.optionsLabel}</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {preset.options.map(opt => {
                const fc = featureCost[opt];
                return <div key={opt} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[.03] px-4 py-3 text-sm">
                  <span className="font-medium text-white/85">{dict.quote.features[opt]}</span>
                  <span className="shrink-0 text-xs font-semibold text-white/75" dir="ltr">+{formatEUR(fc.price, locale)} · +{fc.weeks} {sec.weeksUnit}</span>
                </div>;
              })}
            </div>
          </div>
        </div>
      </section>
      <section className="mt-12 rounded-3xl border border-white/15 bg-[#101216]/90 p-6 text-white sm:p-10" aria-labelledby="service-faq-heading">
        <h2 id="service-faq-heading" className="flex items-center gap-2.5 text-2xl font-bold text-white sm:text-3xl"><HelpCircle aria-hidden size={22}/>{sec.faqTitle}</h2>
        <div className="mt-6 space-y-3">
          {ext.faqs.map((faq, i) => (
            <details key={faq.q} name={`service-faq-${service}`} open={i === 0} className="group rounded-2xl border border-white/15 bg-white/[.03] p-5">
              <summary className="cursor-pointer list-none font-bold text-white">{faq.q}</summary>
              <p className="mt-3 border-t border-white/10 pt-3 text-sm leading-7 text-white/75">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
      <aside className="creation-next"><div><h2>{labels.start}</h2><p>{labels.plan}</p></div><Button asChild variant="neon"><Link href={href}>{detail.title}<ArrowUpRight aria-hidden size={20}/></Link></Button></aside>
    </div>
  </div>;
}
