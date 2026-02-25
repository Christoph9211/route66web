export const AD_ELIGIBILITY_EVENT = 'route66:ad-eligibility-change'

export const AD_ELIGIBILITY_KEYS = {
    age: 'isAdult',
    consent: 'cookieConsent',
}

const ENABLED_FLAG_VALUES = new Set(['1', 'true', 'yes', 'on'])

function getSafeStorage() {
    if (typeof window === 'undefined') return null

    try {
        return window.localStorage
    } catch {
        return null
    }
}

function normalizeBooleanEnvFlag(value) {
    if (typeof value !== 'string') return false
    return ENABLED_FLAG_VALUES.has(value.trim().toLowerCase())
}

export function isSponsorAdsFeatureEnabled() {
    if (typeof window !== 'undefined') {
        const runtimeOverride = window.__ROUTE66_ENABLE_SPONSOR_ADS__
        if (typeof runtimeOverride === 'boolean') {
            return runtimeOverride
        }
    }

    return normalizeBooleanEnvFlag(import.meta.env?.VITE_ENABLE_SPONSOR_ADS)
}

export function getAdEligibilityState() {
    const storage = getSafeStorage()

    if (!storage) {
        return {
            isAdult: false,
            cookieConsent: null,
            canShowAds: false,
        }
    }

    const isAdult = storage.getItem(AD_ELIGIBILITY_KEYS.age) === 'true'
    const cookieConsent = storage.getItem(AD_ELIGIBILITY_KEYS.consent)
    const consentAccepted = cookieConsent === 'accepted'

    return {
        isAdult,
        cookieConsent,
        canShowAds: isAdult && consentAccepted,
    }
}

export function canShowAds() {
    return getAdEligibilityState().canShowAds
}

export function subscribeAdEligibilityChange(callback) {
    if (typeof window === 'undefined' || typeof callback !== 'function') {
        return () => {}
    }

    const emit = () => {
        callback(getAdEligibilityState())
    }

    const onStorage = (event) => {
        if (
            event.key &&
            event.key !== AD_ELIGIBILITY_KEYS.age &&
            event.key !== AD_ELIGIBILITY_KEYS.consent
        ) {
            return
        }
        emit()
    }

    window.addEventListener('storage', onStorage)
    window.addEventListener(AD_ELIGIBILITY_EVENT, emit)
    window.addEventListener('focus', emit)
    document.addEventListener('visibilitychange', emit)

    return () => {
        window.removeEventListener('storage', onStorage)
        window.removeEventListener(AD_ELIGIBILITY_EVENT, emit)
        window.removeEventListener('focus', emit)
        document.removeEventListener('visibilitychange', emit)
    }
}
