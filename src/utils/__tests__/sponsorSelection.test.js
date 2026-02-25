import { beforeEach, describe, expect, it } from 'vitest'
import {
    getEligibleSponsorsForSlot,
    isSponsorActive,
    pickSponsorForSlot,
} from '../sponsorSelection.js'

const now = new Date('2026-02-25T10:00:00')

const sponsorA = {
    id: 'sponsor-a',
    status: 'active',
    placements: ['home_mid_banner'],
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    priority: 10,
    weight: 1,
    creative: { imageSrc: '/a.jpg', alt: 'A' },
    destinationUrl: 'https://example.com/a',
}

const sponsorB = {
    id: 'sponsor-b',
    status: 'active',
    placements: ['home_mid_banner'],
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    priority: 10,
    weight: 5,
    creative: { imageSrc: '/b.jpg', alt: 'B' },
    destinationUrl: 'https://example.com/b',
}

describe('sponsorSelection', () => {
    beforeEach(() => {
        window.sessionStorage.clear()
    })

    it('marks sponsors inactive when paused or outside date range', () => {
        expect(isSponsorActive(sponsorA, now)).toBe(true)

        expect(
            isSponsorActive({ ...sponsorA, status: 'paused' }, now)
        ).toBe(false)
        expect(
            isSponsorActive({ ...sponsorA, endDate: '2026-02-01' }, now)
        ).toBe(false)
    })

    it('filters eligible sponsors by slot and highest priority', () => {
        const sponsors = [
            sponsorA,
            { ...sponsorB, priority: 5 },
            { ...sponsorB, id: 'sponsor-c', placements: ['footer_strip'] },
            { ...sponsorB, id: 'sponsor-d', status: 'paused' },
        ]

        const eligible = getEligibleSponsorsForSlot('home_mid_banner', now, {
            sponsors,
        })

        expect(eligible.map((sponsor) => sponsor.id)).toEqual(['sponsor-a'])
    })

    it('persists a slot selection per page path in session storage', () => {
        const sponsors = [sponsorA, sponsorB]
        const firstPick = pickSponsorForSlot('home_mid_banner', {
            now,
            pagePath: '/test-page',
            sponsors,
            randomFn: () => 0.9,
        })

        const secondPick = pickSponsorForSlot('home_mid_banner', {
            now,
            pagePath: '/test-page',
            sponsors,
            randomFn: () => 0.01,
        })

        expect(firstPick?.id).toBe('sponsor-b')
        expect(secondPick?.id).toBe('sponsor-b')
    })
})
