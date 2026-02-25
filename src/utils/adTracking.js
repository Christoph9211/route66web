import { canShowAds, isSponsorAdsFeatureEnabled } from './adEligibility.js'

function getPagePath() {
    if (typeof window === 'undefined') return '/'
    return window.location.pathname || '/'
}

function trackSponsorEvent(eventName, payload) {
    if (!isSponsorAdsFeatureEnabled() || !canShowAds()) {
        return false
    }

    if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
        return false
    }

    try {
        window.gtag('event', eventName, payload)
        return true
    } catch (error) {
        console.warn(`Unable to track ${eventName}`, error)
        return false
    }
}

export function trackAdImpression({
    sponsorId,
    slotId,
    pagePath = getPagePath(),
}) {
    return trackSponsorEvent('sponsor_impression', {
        sponsor_id: sponsorId,
        slot_id: slotId,
        page_path: pagePath,
    })
}

export function trackAdClick({
    sponsorId,
    slotId,
    destinationUrl,
    pagePath = getPagePath(),
}) {
    return trackSponsorEvent('sponsor_click', {
        sponsor_id: sponsorId,
        slot_id: slotId,
        destination_url: destinationUrl,
        page_path: pagePath,
    })
}
