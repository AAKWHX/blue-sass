import type { ActiveLocale } from '@/lib/i18n/config';
export type LocalText=Record<ActiveLocale,string>;
export const text=(ar:string,en:string,nl:string):LocalText=>({ar,en,nl});
export type DiscoverySite={id:string;name:string;url:string;category:string;description:LocalText;source?:string;cost?:string;costScope?:LocalText};
export const checkedAt='2026-10-17';
