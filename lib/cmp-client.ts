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

export function openCertifiedConsentManager(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  const cmp = window.googlefc;
  if (document.documentElement.dataset.blueSassCmpReady !== 'true' || !cmp?.callbackQueue || typeof cmp.showRevocationMessage !== 'function') return false;
  // Google executes this key synchronously once CONSENT_API_READY has fired.
  cmp.callbackQueue.push({ CONSENT_API_READY: () => {
    if (typeof cmp.showRevocationMessage === 'function') {
      // Google's revocation operation clears the existing consent record.
      window.gtag?.('consent', 'update', {
        ad_storage: 'denied', analytics_storage: 'denied',
        ad_user_data: 'denied', ad_personalization: 'denied',
      });
      cmp.showRevocationMessage();
    }
  } });
  return true;
}

export const cmpUnavailableCopy = {
  ar: 'تعذّر فتح خيارات الخصوصية من Google. أعد تحميل الصفحة وحاول مجددًا، أو تواصل عبر help@bluesass.nl. الإعلانات والتحليلات معطّلة.',
  en: 'Google privacy choices could not be opened. Reload and try again, or contact help@bluesass.nl. Ads and analytics are disabled.',
  nl: 'De privacykeuzes van Google konden niet worden geopend. Herlaad de pagina of neem contact op via help@bluesass.nl. Advertenties en analytics zijn uitgeschakeld.',
} as const;
