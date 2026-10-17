"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cinemaCopy } from '@/lib/i18n/cinema';
import type { ActiveLocale } from '@/lib/i18n/config';
import { ServiceImage } from './service-image';

type Service = { slug: string; title: string; description: string; features: string[] };
/** All service content stays in the document; the enhancement stacks it only after hydration. */
export function ServiceScenes({ services, locale }: { services: Service[]; locale: ActiveLocale }) {
  const c = cinemaCopy(locale);
  return <div className="bs-service-scenes" data-service-scenes>
    <div className="bs-service-deck">{services.map((service, i) => <article className="bs-service-scene" data-service-scene={i} key={service.slug}>
      <span className="bs-scene-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
      <ServiceImage service={service.slug}/>
      <h3>{service.title}</h3><p>{service.description}</p><ul>{service.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
      <Link className="cinema-link" href={`/${locale}/services/${service.slug}`}>{c.details}</Link>
    </article>).reverse()}</div>
    <nav className="bs-service-select" aria-label={c.services}>{services.map((service,i) => <Button key={service.slug} variant="unstyled" size="auto" data-scene-select={i} aria-label={service.title}>{String(i+1).padStart(2,'0')}</Button>)}</nav>
  </div>;
}
