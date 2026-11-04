// Advertising is intentionally unavailable in the CMP-only release.
// This compatibility export cannot load an ad script, even if called directly.
export function AdSense() { return null; }
export { openCertifiedConsentManager } from '@/lib/cmp-client';
