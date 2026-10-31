import type { PortfolioEntry } from '@/lib/db/portfolio';
import type { Locale } from '@/lib/i18n/config';
import { cinemaCopy } from '@/lib/i18n/cinema';

/** Explicit internal illustration, confined to development-only QA routes. No database writes. */
export function motionLabEntry(locale: Locale): PortfolioEntry {
  const c = cinemaCopy(locale);
  return { id: 'blue-sass-study', name: 'Blue Sass / Internal Design Study', summary: c.demo, cover: '/media/service-web-3d.webp', industry: 'BLUE SASS / INTERNAL LAB', updatedAt: new Date('2026-10-15T00:00:00Z'), stage: 'planning', progress: 0, visibility: 'public', features: [c.story, ...c.steps.map(step => step.title)], images: [], url: '', liveUrl: '' };
}
