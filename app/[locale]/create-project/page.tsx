import { publicPageMetadata } from '@/lib/i18n/seo';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDictionary, isLocale } from '@/lib/i18n';
import { publicFeatureFlags } from '@/lib/capabilities';
import { Button } from '@/components/ui/button';
import { immersiveCopy } from '@/lib/i18n/immersive';
import { serviceCatalog } from '@/lib/service-catalog';
import { projectOptions, featureOptions } from '@/lib/project-options';
import type { ProjectType } from '@/lib/pricing';
import './project-catalog.css';
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { return { ...publicPageMetadata((await params).locale, 'create-project', '/create-project'), robots: { index: false, follow: false } }; }
export default async function CreateProjectPage({ params }: { params: Promise<{ locale: string }> }) {
  if (!publicFeatureFlags.projectWorkflows) notFound();
  const { locale: raw } = await params; if (!isLocale(raw)) notFound(); const locale=raw;
  const c=immersiveCopy(locale); const t=getDictionary(locale);
  const groups: ProjectType[]=['web','ecommerce','mobile','erp','ai','brand'];
  return <div className="project-catalog section-y"><div className="container-x">
    <header className="project-catalog-intro"><h1>{c.choose}</h1><p>{c.chooseIntro}</p></header>
    <section aria-labelledby="catalog-services"><h2 id="catalog-services">{c.services}</h2><div className="project-service-grid">{serviceCatalog(locale).map(service => <article key={service.slug}><h3>{service.title}</h3><p>{service.description}</p><ul>{service.features.map(f=><li key={f}>{f}</li>)}</ul><div className="project-catalog-actions"><Link href={`/${locale}/services/${service.slug}`}>{c.details}</Link><Button asChild variant="ghostNeon"><Link href={`/${locale}/quote?type=${service.quoteType}&service=${service.slug}`}>{c.start}</Link></Button></div></article>)}</div></section>
    <section aria-labelledby="catalog-projects"><h2 id="catalog-projects">{c.projects}</h2><div className="project-type-grid">{groups.map(type=><article key={type}><h3>{t.quote.types[type]}</h3><ul className="project-kind-list">{projectOptions.filter(p=>p.type===type).map(p=><li key={p.id}><Link href={`/${locale}/quote?type=${type}&kind=${p.id}`} data-project-kind={p.id}>{p.names[locale]}</Link></li>)}</ul><h4>{c.features}</h4><ul className="project-feature-list">{featureOptions[type].map(f=><li key={f}>{t.quote.features[f]}</li>)}</ul></article>)}</div></section>
  </div></div>;
}
