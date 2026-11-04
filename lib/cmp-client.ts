type GoogleConsentValues = {
  adStoragePurposeConsentStatus?: number;
  analyticsStoragePurposeConsentStatus?: number;
  adUserDataPurposeConsentStatus?: number;
  adPersonalizationPurposeConsentStatus?: number;
};
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    googlefc?: {
      callbackQueue?: Array<Record<string, () => void>>;
      showRevocationMessage?: () => void;
      getGoogleConsentModeValues?: () => GoogleConsentValues;
    };
  }
}

export async function openCertifiedConsentManager(): Promise<boolean> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  const cmp = window.googlefc;
  const queue = cmp?.callbackQueue;
  const reopen = cmp?.showRevocationMessage;
  if (!queue || typeof reopen !== 'function') return false;
  // Google owns readiness. Merely queuing a callback is not a successful call.
  return new Promise(resolve => {
    let pending = true;
    const timer = setTimeout(() => { pending = false; resolve(false); }, 3000);
    try {
      queue.push({ CONSENT_API_READY: () => {
        if (!pending) return;
        pending = false;
        clearTimeout(timer);
        try {
          // The official revocation operation clears the existing record.
          window.gtag?.('consent', 'update', {
            ad_storage: 'denied', analytics_storage: 'denied',
            ad_user_data: 'denied', ad_personalization: 'denied',
          });
          reopen.call(cmp);
          resolve(true);
        } catch { resolve(false); }
      } });
    } catch { pending = false; clearTimeout(timer); resolve(false); }
  });
}

export const cmpUnavailableCopy = {
  ar: 'تعذّر فتح خيارات الخصوصية من Google. أعد تحميل الصفحة وحاول مجددًا، أو تواصل عبر help@bluesass.nl. الإعلانات والتحليلات معطّلة.',
  en: 'Google privacy choices could not be opened. Reload and try again, or contact help@bluesass.nl. Ads and analytics are disabled.',
  nl: 'De privacykeuzes van Google konden niet worden geopend. Herlaad de pagina of neem contact op via help@bluesass.nl. Advertenties en analytics zijn uitgeschakeld.',
} as const;
