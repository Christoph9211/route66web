/**
 * analytics-consent.js
 * Coordinates age gate + cookie consent with Google Analytics 4.
 * Exposes globals:
 *   - window.confirmAge21()
 *   - window.tryInitAnalytics()
 *   - window.revokeAnalyticsConsent()
 * Relies on localStorage keys:
 *   - isAdult = "true"
 *   - cookieConsent = "accepted" | "declined"
 */

(function () {
  const GA_ID = "G-RGSJT8T1EF";
  const SCRIPT_ID = "ga4-base-script";
  const CONSENT_DENIED_STATE = {
    ad_storage: "denied",
    analytics_storage: "denied",
    personalization_storage: "denied",
    functionality_storage: "granted",
    security_storage: "granted",
  };
  const CONSENT_GRANTED_STATE = {
    ad_storage: "denied",
    analytics_storage: "granted",
    personalization_storage: "denied",
    functionality_storage: "granted",
    security_storage: "granted",
  };

  function getSafeLocalStorage() {
    try {
      return window.localStorage;
    } catch (error) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn(
          "localStorage is unavailable; analytics consent state will not persist.",
          error
        );
      }
      return null;
    }
  }

  function ensureDataLayer() {
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== "function") {
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
    }
  }

  function ensureAnalyticsScript() {
    if (document.getElementById(SCRIPT_ID)) return;
    const script = document.createElement("script");
    script.async = true;
    script.id = SCRIPT_ID;
    script.src =
      "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    document.head.appendChild(script);
  }

  function applyConsentDefaults() {
    ensureDataLayer();
    window.gtag("consent", "default", CONSENT_DENIED_STATE);
  }

  function activateAnalytics() {
    if (window.__analyticsActivated) return;
    window.__analyticsActivated = true;

    ensureAnalyticsScript();
    ensureDataLayer();
    window.gtag("consent", "update", CONSENT_GRANTED_STATE);
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { anonymize_ip: true });
  }

  function revokeAnalyticsConsent() {
    if (!window.__analyticsActivated) return;
    window.__analyticsActivated = false;
    ensureDataLayer();
    window.gtag("consent", "update", CONSENT_DENIED_STATE);
  }

  function tryInitAnalytics() {
    const storage = getSafeLocalStorage();
    if (!storage) return;

    const isAdult = storage.getItem("isAdult") === "true";
    const consentOk = storage.getItem("cookieConsent") === "accepted";

    if (isAdult && consentOk) {
      activateAnalytics();
    } else {
      revokeAnalyticsConsent();
    }
  }

  function confirmAge21() {
    const storage = getSafeLocalStorage();
    const banner = document.getElementById("cookie-banner");

    if (!storage) {
      if (banner) banner.style.display = "none";
      return;
    }

    storage.setItem("isAdult", "true");

    const hasChoice = !!storage.getItem("cookieConsent");
    if (!hasChoice && banner) banner.style.display = "flex";

    tryInitAnalytics();
  }

  applyConsentDefaults();

  window.tryInitAnalytics = tryInitAnalytics;
  window.confirmAge21 = confirmAge21;
  window.revokeAnalyticsConsent = revokeAnalyticsConsent;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tryInitAnalytics);
  } else {
    tryInitAnalytics();
  }

  window.addEventListener("storage", (event) => {
    if (event.key === "cookieConsent" || event.key === "isAdult") {
      tryInitAnalytics();
    }
  });
})();
