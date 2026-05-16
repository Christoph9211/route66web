/**
 * analytics-consent.js
 * Coordinates age gate + cookie consent with Google Analytics 4 and Google AdSense Auto ads.
 * Exposes globals:
 *   - window.confirmAge21()
 *   - window.tryInitAnalytics()
 *   - window.tryInitAdsense()
 *   - window.revokeAnalyticsConsent()
 *   - window.revokeAdsenseConsent()
 * Relies on localStorage keys:
 *   - isAdult = "true"
 *   - cookieConsent = "accepted" | "declined"
 */

(function () {
  const GA_ID = window.VITE_GA_ID || "G-RGSJT8T1EF";
  const SCRIPT_ID = "ga4-base-script";
  const ADSENSE_SCRIPT_ID = "adsense-auto-ads-script";
  const AD_ELIGIBILITY_EVENT = "route66:ad-eligibility-change";
  const ADSENSE_CLIENT_ID =
    typeof window.VITE_ADSENSE_CLIENT === "string"
      ? window.VITE_ADSENSE_CLIENT.trim()
      : "";
  const ADSENSE_ENABLED = parseBooleanFlag(window.VITE_ENABLE_ADSENSE);
  const DEFAULT_ADSENSE_EXCLUDE_PATHS = [
    "/privacy-policy",
    "/cookie-policy",
    "/terms-of-service",
  ];
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
  let activationHandle = null;
  let activationHandleType = null;

  function parseBooleanFlag(value) {
    if (typeof value === "boolean") return value;
    if (typeof value !== "string") return false;
    const normalized = value.trim().toLowerCase();
    return (
      normalized === "1" ||
      normalized === "true" ||
      normalized === "yes" ||
      normalized === "on"
    );
  }

  function normalizePathname(pathname) {
    if (typeof pathname !== "string" || pathname.length === 0) return "/";
    const normalized = pathname.replace(/\/+$/, "") || "/";
    return normalized;
  }

  function getCurrentPathname() {
    return normalizePathname(window.location && window.location.pathname);
  }

  function getAdsenseExcludedPaths() {
    const configured = Array.isArray(window.ROUTE66_ADSENSE_EXCLUDE_PATHS)
      ? window.ROUTE66_ADSENSE_EXCLUDE_PATHS
      : [];
    const merged = new Set(DEFAULT_ADSENSE_EXCLUDE_PATHS.map(normalizePathname));

    configured.forEach((path) => {
      if (typeof path === "string" && path.trim()) {
        merged.add(normalizePathname(path.trim()));
      }
    });

    return merged;
  }

  function isAdsensePathExcluded() {
    return getAdsenseExcludedPaths().has(getCurrentPathname());
  }

  function hasValidAdsenseClientId() {
    return /^ca-pub-\d{10,}$/.test(ADSENSE_CLIENT_ID);
  }

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

  function ensureAdsenseMetaTag() {
    if (!hasValidAdsenseClientId()) return;

    let meta = document.querySelector('meta[name="google-adsense-account"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "google-adsense-account";
      document.head.appendChild(meta);
    }

    if (meta.content !== ADSENSE_CLIENT_ID) {
      meta.content = ADSENSE_CLIENT_ID;
    }
  }

  function ensureAdsenseScript() {
    if (!hasValidAdsenseClientId()) return false;
    if (document.getElementById(ADSENSE_SCRIPT_ID)) return true;

    const script = document.createElement("script");
    script.async = true;
    script.id = ADSENSE_SCRIPT_ID;
    script.crossOrigin = "anonymous";
    script.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" +
      encodeURIComponent(ADSENSE_CLIENT_ID);
    document.head.appendChild(script);
    return true;
  }

  function emitAdEligibilityState(detail) {
    try {
      window.dispatchEvent(
        new CustomEvent(AD_ELIGIBILITY_EVENT, {
          detail: detail || null,
        })
      );
    } catch (error) {
      if (typeof console !== "undefined" && console.warn) {
        console.warn("Unable to dispatch ad eligibility event.", error);
      }
    }
  }

  function applyConsentDefaults() {
    ensureDataLayer();
    window.gtag("consent", "default", CONSENT_DENIED_STATE);
  }

  function canUseAdsenseOnThisPage() {
    if (!ADSENSE_ENABLED) return false;
    if (!hasValidAdsenseClientId()) {
      if (
        typeof console !== "undefined" &&
        console.warn &&
        !window.__adsenseConfigWarned
      ) {
        window.__adsenseConfigWarned = true;
        console.warn(
          "AdSense is enabled but VITE_ADSENSE_CLIENT is missing or invalid (expected ca-pub-...)."
        );
      }
      return false;
    }
    return !isAdsensePathExcluded();
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

  function activateAdsense() {
    if (window.__adsenseActivated) return;
    if (!canUseAdsenseOnThisPage()) return;

    ensureAdsenseMetaTag();
    const scriptAdded = ensureAdsenseScript();
    if (!scriptAdded) return;

    window.adsbygoogle = window.adsbygoogle || [];
    window.__adsenseActivated = true;
  }

  function clearScheduledActivation() {
    if (activationHandle === null) return;
    if (
      activationHandleType === "idle" &&
      typeof window.cancelIdleCallback === "function"
    ) {
      window.cancelIdleCallback(activationHandle);
    } else {
      window.clearTimeout(activationHandle);
    }
    activationHandle = null;
    activationHandleType = null;
  }

  function scheduleActivateAnalytics() {
    if (window.__analyticsActivated || activationHandle !== null) return;

    const runActivation = () => {
      activationHandle = null;
      activationHandleType = null;
      activateAnalytics();
    };

    if (typeof window.requestIdleCallback === "function") {
      activationHandleType = "idle";
      activationHandle = window.requestIdleCallback(runActivation, {
        timeout: 2000,
      });
    } else {
      activationHandleType = "timeout";
      activationHandle = window.setTimeout(runActivation, 1500);
    }
  }

  function revokeAnalyticsConsent() {
    clearScheduledActivation();
    if (!window.__analyticsActivated) return;
    window.__analyticsActivated = false;
    ensureDataLayer();
    window.gtag("consent", "update", CONSENT_DENIED_STATE);
  }

  function revokeAdsenseConsent() {
    // AdSense cannot be cleanly unloaded once the base script has been fetched.
    // We strictly gate activation before load; this function prevents future activation in the current session.
    if (!window.__adsenseActivated) return;
    window.__adsenseConsentRevoked = true;
  }

  function tryInitAdsense(state) {
    if (!ADSENSE_ENABLED) return;
    if (window.__adsenseConsentRevoked) return;

    const isAdult = !!(state && state.isAdult);
    const consentOk = !!(state && state.consentOk);

    if (isAdult && consentOk) {
      activateAdsense();
    } else {
      revokeAdsenseConsent();
    }
  }

  function tryInitAnalytics() {
    const storage = getSafeLocalStorage();
    if (!storage) {
      tryInitAdsense({ isAdult: false, consentOk: false });
      emitAdEligibilityState({
        isAdult: false,
        cookieConsent: null,
        canShowAds: false,
      });
      return;
    }

    const cookieConsent = storage.getItem("cookieConsent");
    const isAdult = storage.getItem("isAdult") === "true";
    const consentOk = cookieConsent === "accepted";
    tryInitAdsense({ isAdult: isAdult, consentOk: consentOk });
    emitAdEligibilityState({
      isAdult: isAdult,
      cookieConsent: cookieConsent,
      canShowAds: isAdult && consentOk,
    });

    if (isAdult && consentOk) {
      scheduleActivateAnalytics();
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
  if (ADSENSE_ENABLED && canUseAdsenseOnThisPage()) {
    ensureAdsenseMetaTag();
  }

  window.tryInitAnalytics = tryInitAnalytics;
  window.tryInitAdsense = tryInitAdsense;
  window.confirmAge21 = confirmAge21;
  window.revokeAnalyticsConsent = revokeAnalyticsConsent;
  window.revokeAdsenseConsent = revokeAdsenseConsent;

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
