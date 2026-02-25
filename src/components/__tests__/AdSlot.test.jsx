import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

const {
    mockCanShowAds,
    mockIsFeatureEnabled,
    mockSubscribe,
    mockPickSponsor,
    mockTrackImpression,
    mockTrackClick,
} = vi.hoisted(() => ({
    mockCanShowAds: vi.fn(),
    mockIsFeatureEnabled: vi.fn(),
    mockSubscribe: vi.fn(() => () => {}),
    mockPickSponsor: vi.fn(),
    mockTrackImpression: vi.fn(),
    mockTrackClick: vi.fn(),
}))

vi.mock('../../utils/adEligibility.js', () => ({
    canShowAds: () => mockCanShowAds(),
    isSponsorAdsFeatureEnabled: () => mockIsFeatureEnabled(),
    subscribeAdEligibilityChange: (...args) => mockSubscribe(...args),
}))

vi.mock('../../utils/sponsorSelection.js', () => ({
    pickSponsorForSlot: (...args) => mockPickSponsor(...args),
}))

vi.mock('../../utils/adTracking.js', () => ({
    trackAdImpression: (...args) => mockTrackImpression(...args),
    trackAdClick: (...args) => mockTrackClick(...args),
}))

import AdSlot from '../AdSlot.jsx'

const sponsor = {
    id: 'sponsor-1',
    name: 'Test Sponsor',
    destinationUrl: 'https://example.com',
    ctaText: 'Visit',
    creative: {
        imageSrc: '/sponsor.jpg',
        alt: 'Test sponsor creative',
        width: 1200,
        height: 300,
    },
}

describe('AdSlot', () => {
    beforeEach(() => {
        mockCanShowAds.mockReset()
        mockIsFeatureEnabled.mockReset()
        mockSubscribe.mockReset().mockReturnValue(() => {})
        mockPickSponsor.mockReset()
        mockTrackImpression.mockReset()
        mockTrackClick.mockReset()
        window.sessionStorage.clear()
        delete window.IntersectionObserver
    })

    it('renders nothing when the sponsor ads feature is disabled', () => {
        mockIsFeatureEnabled.mockReturnValue(false)
        mockCanShowAds.mockReturnValue(true)

        const { container } = render(<AdSlot slotId="home_mid_banner" />)
        expect(container).toBeEmptyDOMElement()
    })

    it('renders a blocked placeholder until age+consent eligibility passes', async () => {
        mockIsFeatureEnabled.mockReturnValue(true)
        mockCanShowAds.mockReturnValue(false)
        mockPickSponsor.mockReturnValue(sponsor)

        render(<AdSlot slotId="home_mid_banner" />)

        const slot = await screen.findByTestId('ad-slot-home_mid_banner')
        expect(slot).toHaveAttribute('data-state', 'blocked')
        expect(
            screen.getByText(/shown after age confirmation and cookie consent/i)
        ).toBeInTheDocument()
    })

    it('renders sponsor content and tracks click/impression once', async () => {
        mockIsFeatureEnabled.mockReturnValue(true)
        mockCanShowAds.mockReturnValue(true)
        mockPickSponsor.mockReturnValue(sponsor)

        const { rerender } = render(<AdSlot slotId="home_mid_banner" />)

        const link = await screen.findByRole('link', {
            name: /sponsored: test sponsor/i,
        })
        expect(link.getAttribute('rel')).toContain('sponsored')
        expect(link.getAttribute('rel')).toContain('nofollow')

        await waitFor(() => {
            expect(mockTrackImpression).toHaveBeenCalledTimes(1)
        })

        rerender(<AdSlot slotId="home_mid_banner" />)

        await waitFor(() => {
            expect(mockTrackImpression).toHaveBeenCalledTimes(1)
        })

        fireEvent.click(link)
        expect(mockTrackClick).toHaveBeenCalledTimes(1)
    })
})
