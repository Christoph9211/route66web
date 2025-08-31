/**
 * analytics-consent.js
 * Wires Age→Consent→Analytics.
 * Exposes:
 *   - window.confirmAge21()
 *   - window.tryInitAnalytics()
 * Depends on:
 *   - localStorage.isAdult = "true"      (set by confirmAge21)
 *   - localStorage.cookieConsent = "accepted" | "declined" (set by banner)
 */

(function () {
  // --- 1) Load GA ONLY after both flags are satisfied ---
  function loadAnalytics() {
    if (window.__analyticsLoaded) return;
    window.__analyticsLoaded = true;

    // GA4 (using existing site ID)
    const GA_ID = "G-RGSJT8T1EF"; // update if needed

    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  // --- 2) Public: tryInitAnalytics (check both conditions) ---
  function tryInitAnalytics() {
    const isAdult   = localStorage.getItem("isAdult") === "true";
    const consentOk = localStorage.getItem("cookieConsent") === "accepted";
    if (isAdult && consentOk) loadAnalytics();
  }

  // --- 3) Public: confirmAge21 (called by your age gate) ---
  function confirmAge21() {
    localStorage.setItem("isAdult", "true");

    // Show cookie banner if no prior choice
    const hasChoice = !!localStorage.getItem("cookieConsent");
    const banner = document.getElementById("cookie-banner");
    if (!hasChoice && banner) banner.style.display = "flex"; // unhide (override CSS display:none)

    // In case consent was already accepted earlier
    tryInitAnalytics();
  }

  // Expose globally
  window.tryInitAnalytics = tryInitAnalytics;
  window.confirmAge21 = confirmAge21;

  // If user already confirmed age AND consented before, load immediately on page load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", tryInitAnalytics);
  } else {
    tryInitAnalytics();
  }
})();
