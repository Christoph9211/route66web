export const AD_SLOT_IDS = {
    homeMidBanner: 'home_mid_banner',
    sidebarCard: 'sidebar_card',
    footerStrip: 'footer_strip',
}

export const AD_SLOT_CONFIG = {
    [AD_SLOT_IDS.homeMidBanner]: {
        id: AD_SLOT_IDS.homeMidBanner,
        label: 'Homepage Mid-Content Banner',
        variant: 'banner',
        minHeight: 180,
        dimensions: { width: 1200, height: 300 },
    },
    [AD_SLOT_IDS.sidebarCard]: {
        id: AD_SLOT_IDS.sidebarCard,
        label: 'Sidebar Sponsor Card',
        variant: 'card',
        minHeight: 320,
        dimensions: { width: 300, height: 250 },
    },
    [AD_SLOT_IDS.footerStrip]: {
        id: AD_SLOT_IDS.footerStrip,
        label: 'Footer Sponsor Strip',
        variant: 'strip',
        minHeight: 120,
        dimensions: { width: 728, height: 90 },
    },
}

export function getAdSlotConfig(slotId) {
    return AD_SLOT_CONFIG[slotId] ?? null
}
