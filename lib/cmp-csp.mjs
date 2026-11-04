import { CMP_ENABLED, CMP_ORIGIN } from './cmp-policy.mjs';

export function publicContentSecurityPolicy(cmpEnabled = CMP_ENABLED) {
  const cmp = cmpEnabled ? ` ${CMP_ORIGIN}` : '';
  return `default-src 'self'; script-src 'self' 'unsafe-inline'${cmp}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:${cmp}; font-src 'self' data:; connect-src 'self'${cmp}; media-src 'self' blob:; frame-src ${cmpEnabled ? `'self' ${CMP_ORIGIN}` : "'none'"}; form-action 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; upgrade-insecure-requests`;
}
