import { AD_SLOT_IDS } from '../constants/adSlots.js'

const demoImage = '/assets/images/route-66-hemp-og-image-1024w.jpg'

const sponsorInventory = [
    {
        id: 'demo-sponsor-replace-before-launch',
        name: 'Demo Sponsor (Replace Before Launch)',
        status: 'active',
        placements: [
            AD_SLOT_IDS.homeMidBanner,
            AD_SLOT_IDS.sidebarCard,
            AD_SLOT_IDS.footerStrip,
        ],
        startDate: '2026-01-01',
        endDate: '2027-12-31',
        priority: 10,
        weight: 1,
        creative: {
            imageSrc: demoImage,
            alt: 'Demo sponsor creative placeholder. Replace with approved sponsor artwork before enabling ads.',
            width: 1024,
            height: 538,
        },
        creatives: {
            [AD_SLOT_IDS.homeMidBanner]: {
                imageSrc: demoImage,
                alt: 'Demo sponsor banner placeholder',
                width: 1200,
                height: 300,
            },
            [AD_SLOT_IDS.sidebarCard]: {
                imageSrc: demoImage,
                alt: 'Demo sponsor card placeholder',
                width: 300,
                height: 250,
            },
            [AD_SLOT_IDS.footerStrip]: {
                imageSrc: demoImage,
                alt: 'Demo sponsor footer strip placeholder',
                width: 728,
                height: 90,
            },
        },
        destinationUrl: 'https://example.com',
        ctaText: 'Visit Sponsor',
        nofollow: true,
        sponsoredRel: true,
        disclosureLabel: 'Sponsored',
    },
]

export default sponsorInventory
