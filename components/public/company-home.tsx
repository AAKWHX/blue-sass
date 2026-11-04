import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { BottomSculpture, PremiumMotion, PremiumVisual } from './premium-motion';
import { Button } from '@/components/ui/button';
import { recoveredHeroCopy } from '@/lib/i18n/recovered-hero';
import { companyHomeCopy } from '@/lib/i18n/company-home';
import type { ActiveLocale } from '@/lib/i18n/config';
import { serviceCatalog } from '@/lib/service-catalog';
import './company-home.css';
import './premium-home.css';
import './recovered-cinema.css';

export function CompanyHome({ locale, children }: { locale: ActiveLocale; children: ReactNode }) {
 const c = companyHomeCopy(locale),h=recoveredHeroCopy(locale);
 const base = `/${locale}`;
 return <PremiumMotion locale={locale}><div className="company-home cinema-home recovered-cinema">
  <section className="prism-hero" aria-labelledby="company-title"><div className="prism-hero-grid recovered-wrap"><div className="prism-copy"><h1 id="company-title">{h.title.map(line=><span key={line}>{line}</span>)}</h1><p className="prism-intro">{h.intro}</p><div className="prism-actions"><Button asChild variant="unstyled" size="auto" className="prism-cta"><Link href={`${base}/contact#inquiry`}>{h.start}<ArrowUpRight size={18} aria-hidden="true"/></Link></Button><a href="#studio-services" className="prism-explore">{h.explore}<ArrowDown size={16} aria-hidden="true"/></a></div></div><PremiumVisual locale={locale}/></div></section>
  <section id="studio-services" className="company-section company-wrap" aria-labelledby="company-services-title"><div className="recovered-service-heading"><h2 id="company-services-title">{c.services}</h2><p className="company-section-intro">{c.servicesIntro}</p></div><div className="company-services">{serviceCatalog(locale).map((service) => <article key={service.slug} data-service={service.slug} className="z-stage"><i className="catalog-light" aria-hidden="true"/><div className="premium-service-copy"><h3><Link href={`${base}/services/${service.slug}`}>{service.title}</Link></h3><p>{service.description}</p><ul>{service.features.map(feature => <li key={feature}>{feature}</li>)}</ul><Link className="company-detail-link" href={`${base}/services/${service.slug}`}>{c.details}<ArrowUpRight size={17} aria-hidden="true"/></Link></div><div className="premium-service-art" aria-hidden="true"><Image src={`/media/service-${service.slug}-3d.webp`} alt="" fill sizes="(max-width: 760px) 90vw, 45vw"/></div></article>)}</div></section>
  <section className="company-section company-wrap" aria-labelledby="company-process-title"><div className="recovered-service-heading"><p className="text-xs font-semibold uppercase tracking-widest text-ink-low">{c.focus}</p><h2 id="company-process-title">{c.process}</h2><p className="company-section-intro">{c.intro}</p></div><div className="mt-8 grid gap-6 md:grid-cols-3">{c.steps.map((step, idx) => <article key={step.title} className="rounded-2xl border border-white/15 bg-white/[0.04] p-6"><span className="font-mono text-xs font-bold text-ink-low">0{idx + 1}</span><h3 className="mt-2 text-xl font-bold text-ink-hi">{step.title}</h3><p className="mt-2 leading-7 text-ink-low">{step.text}</p></article>)}</div><ul className="mt-6 flex flex-wrap gap-3">{c.assurances.map(item => <li key={item} className="rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-sm text-ink-mid">{item}</li>)}</ul></section>
  {children}
  <section className="company-contact company-section company-wrap" data-premium-reveal aria-labelledby="company-contact-title"><BottomSculpture/><h2 id="company-contact-title">{h.closing}</h2><p className="company-section-intro">{c.closingText}</p><div className="company-actions"><Button asChild variant="neon"><Link href={`${base}/contact#inquiry`}>{c.start}</Link></Button><Button asChild variant="outline"><Link href={`${base}/contact`}>{c.contact}</Link></Button><a href="mailto:help@bluesass.nl" dir="ltr">help@bluesass.nl</a></div></section>
 </div></PremiumMotion>;
}
