import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
    AD_ELIGIBILITY_EVENT,
    canShowAds,
    getAdEligibilityState,
    isSponsorAdsFeatureEnabled,
    subscribeAdEligibilityChange,
} from '../adEligibility.js'

describe('adEligibility', () => {
    beforeEach(() => {
        window.localStorage.clear()
        window.__ROUTE66_ENABLE_SPONSOR_ADS__ = undefined
    })

    it('returns false until both age confirmation and accepted consent exist', () => {
        expect(canShowAds()).toBe(false)

        window.localStorage.setItem('isAdult', 'true')
        expect(canShowAds()).toBe(false)

        window.localStorage.setItem('cookieConsent', 'declined')
        expect(canShowAds()).toBe(false)

        window.localStorage.setItem('cookieConsent', 'accepted')
        expect(canShowAds()).toBe(true)
    })

    it('supports a runtime feature flag override for sponsor ads', () => {
        window.__ROUTE66_ENABLE_SPONSOR_ADS__ = true
        expect(isSponsorAdsFeatureEnabled()).toBe(true)

        window.__ROUTE66_ENABLE_SPONSOR_ADS__ = false
        expect(isSponsorAdsFeatureEnabled()).toBe(false)
    })

    it('notifies subscribers on the custom eligibility event', () => {
        const callback = vi.fn()
        const unsubscribe = subscribeAdEligibilityChange(callback)

        window.localStorage.setItem('isAdult', 'true')
        window.localStorage.setItem('cookieConsent', 'accepted')
        window.dispatchEvent(new CustomEvent(AD_ELIGIBILITY_EVENT))

        expect(callback).toHaveBeenCalled()
        expect(getAdEligibilityState().canShowAds).toBe(true)

        unsubscribe()
    })
})
