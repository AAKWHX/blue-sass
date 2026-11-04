(function () {
  'use strict';
  var root = document.documentElement;
  if (root.dataset.blueSassCmpInitialized === 'true') return;
  root.dataset.blueSassCmpInitialized = 'true';
  root.dataset.blueSassCmpReady = 'false';
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  var denied = {
    ad_storage: 'denied', analytics_storage: 'denied',
    ad_user_data: 'denied', ad_personalization: 'denied'
  };
  window.gtag('consent', 'default', Object.assign({ wait_for_update: 500 }, denied));
  window.gtag('set', 'ads_data_redaction', true);
  window.gtag('set', 'url_passthrough', false);

  window.googlefc = window.googlefc || {};
  window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
  var consentModeReady = false;
  var lastSignals = '';
  function syncGoogleSignals() {
    if (!consentModeReady) return;
    var values;
    try {
      values = typeof window.googlefc.getGoogleConsentModeValues === 'function' ? window.googlefc.getGoogleConsentModeValues() : null;
    } catch { values = null; }
    // Only Google's actual GRANTED value grants a purpose. Missing, denied,
    // not-applicable and not-configured values never imply acceptance.
    var signals = {
      ad_storage: values && values.adStoragePurposeConsentStatus === 1 ? 'granted' : 'denied',
      analytics_storage: values && values.analyticsStoragePurposeConsentStatus === 1 ? 'granted' : 'denied',
      ad_user_data: values && values.adUserDataPurposeConsentStatus === 1 ? 'granted' : 'denied',
      ad_personalization: values && values.adPersonalizationPurposeConsentStatus === 1 ? 'granted' : 'denied'
    };
    var signature = JSON.stringify(signals);
    if (signature !== lastSignals) {
      lastSignals = signature;
      window.gtag('consent', 'update', signals);
    }
  }
  window.googlefc.callbackQueue.push({
    CONSENT_MODE_DATA_READY: function () {
      consentModeReady = true;
      syncGoogleSignals();
    }
  });
  window.googlefc.callbackQueue.push({
    CONSENT_API_READY: function () {
      if (typeof window.googlefc.showRevocationMessage === 'function') root.dataset.blueSassCmpReady = 'true';
      if (typeof window.__tcfapi !== 'function') return;
      window.__tcfapi('addEventListener', 2, function (data, success) {
        if (!success || !data) return;
        // TCF readiness is not a Google purpose grant. Google owns subsequent
        // Consent Mode updates when its account-level integration is enabled.
        // In particular, never read stale purpose values during a TCF change.
        root.dataset.blueSassCmpTcf = 'available';
        if (typeof window.googlefc.showRevocationMessage === 'function') root.dataset.blueSassCmpReady = 'true';
      });
    }
  });

  // Presence signal from Google's account-provided messaging tag. The optional
  // ad-blocker error-protection snippet is intentionally not installed.
  function signalGooglefcPresent() {
    if (!window.frames.googlefcPresent) {
      if (document.body) {
        var iframe = document.createElement('iframe');
        iframe.style = 'width: 0; height: 0; border: none; z-index: -1000; left: -1000px; top: -1000px;';
        iframe.style.display = 'none';
        iframe.name = 'googlefcPresent';
        document.body.appendChild(iframe);
      } else { setTimeout(signalGooglefcPresent, 0); }
    }
  }
  signalGooglefcPresent();
})();
