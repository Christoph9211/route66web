import React from 'react'
import { getAdSlotConfig } from '../constants/adSlots.js'
import {
    canShowAds,
    isSponsorAdsFeatureEnabled,
    subscribeAdEligibilityChange,
} from '../utils/adEligibility.js'
import { pickSponsorForSlot } from '../utils/sponsorSelection.js'
import { trackAdClick, trackAdImpression } from '../utils/adTracking.js'

const IMPRESSION_KEY_PREFIX = 'route66:sponsor-impression'

function getSafeSessionStorage() {
    if (typeof window === 'undefined') return null

    try {
        return window.sessionStorage
    } catch {
        return null
    }
}

function getPagePath() {
    if (typeof window === 'undefined') return '/'
    return window.location.pathname || '/'
}

function getImpressionKey(slotId, sponsorId, pagePath) {
    return `${IMPRESSION_KEY_PREFIX}:${pagePath}:${slotId}:${sponsorId}`
}

function joinClasses(...values) {
    return values.filter(Boolean).join(' ')
}

function buildPaidLinkRel(sponsor) {
    const relParts = ['noopener', 'noreferrer']

    if (sponsor?.nofollow !== false) {
        relParts.push('nofollow')
    }
    if (sponsor?.sponsoredRel !== false) {
        relParts.push('sponsored')
    }

    return [...new Set(relParts)].join(' ')
}

function resolveCreative(sponsor, slotId, slotConfig) {
    if (!sponsor) return null

    const slotCreative =
        sponsor.creatives && typeof sponsor.creatives === 'object'
            ? sponsor.creatives[slotId]
            : null
    const creative = slotCreative ?? sponsor.creative ?? null
    if (!creative) return null

    return {
        imageSrc: creative.imageSrc,
        alt:
            creative.alt ??
            sponsor.creative?.alt ??
            `${sponsor.name} sponsored placement`,
        width: creative.width ?? slotConfig?.dimensions?.width,
        height: creative.height ?? slotConfig?.dimensions?.height,
    }
}

function getShellClasses(variant) {
    switch (variant) {
        case 'card':
            return 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900'
        case 'strip':
            return 'rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm'
        case 'banner':
        default:
            return 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800'
    }
}

function getImageClasses(variant) {
    switch (variant) {
        case 'card':
            return 'h-44 w-full rounded-xl object-cover'
        case 'strip':
            return 'h-20 w-full rounded-xl object-cover sm:h-16 sm:w-44'
        case 'banner':
        default:
            return 'h-28 w-full rounded-xl object-cover sm:h-36'
    }
}

export default function AdSlot({
    slotId,
    className = '',
    fallbackHeight,
    variant,
    trackImpression = true,
    trackClick = true,
}) {
    const featureEnabled = isSponsorAdsFeatureEnabled()
    const slotConfig = getAdSlotConfig(slotId)
    const resolvedVariant = variant ?? slotConfig?.variant ?? 'banner'
    const minHeight = fallbackHeight ?? slotConfig?.minHeight ?? 120
    const pagePath = getPagePath()

    const [isEligible, setIsEligible] = React.useState(
        () => featureEnabled && canShowAds()
    )
    const [sponsor, setSponsor] = React.useState(() =>
        featureEnabled && canShowAds()
            ? pickSponsorForSlot(slotId, { pagePath })
            : null
    )
    const slotRef = React.useRef(null)
    const impressionTrackedRef = React.useRef(false)

    React.useEffect(() => {
        if (!featureEnabled) return undefined

        const syncState = () => {
            const eligible = canShowAds()
            setIsEligible(eligible)
            setSponsor(
                eligible ? pickSponsorForSlot(slotId, { pagePath }) : null
            )
        }

        syncState()
        return subscribeAdEligibilityChange(syncState)
    }, [featureEnabled, pagePath, slotId])

    React.useEffect(() => {
        impressionTrackedRef.current = false
    }, [slotId, sponsor?.id, pagePath])

    React.useEffect(() => {
        if (!featureEnabled || !isEligible || !sponsor || !trackImpression) {
            return undefined
        }

        const sessionStorage = getSafeSessionStorage()
        const impressionKey = getImpressionKey(slotId, sponsor.id, pagePath)

        if (sessionStorage?.getItem(impressionKey) === '1') {
            impressionTrackedRef.current = true
            return undefined
        }

        const markTracked = () => {
            if (impressionTrackedRef.current) return
            impressionTrackedRef.current = true
            sessionStorage?.setItem(impressionKey, '1')
            trackAdImpression({
                sponsorId: sponsor.id,
                slotId,
                pagePath,
            })
        }

        if (
            typeof window === 'undefined' ||
            typeof window.IntersectionObserver !== 'function' ||
            !slotRef.current
        ) {
            markTracked()
            return undefined
        }

        const observer = new window.IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    markTracked()
                    observer.disconnect()
                }
            },
            { threshold: 0.35 }
        )

        observer.observe(slotRef.current)

        return () => observer.disconnect()
    }, [featureEnabled, isEligible, pagePath, slotId, sponsor, trackImpression])

    const handleClick = React.useCallback(() => {
        if (!trackClick || !sponsor) return

        trackAdClick({
            sponsorId: sponsor.id,
            slotId,
            destinationUrl: sponsor.destinationUrl,
            pagePath,
        })
    }, [pagePath, slotId, sponsor, trackClick])

    if (!featureEnabled) {
        return null
    }

    const disclosureLabel = sponsor?.disclosureLabel || 'Sponsored'
    const creative = resolveCreative(sponsor, slotId, slotConfig)

    const shellClasses = joinClasses(
        'ad-slot',
        getShellClasses(resolvedVariant),
        className
    )

    if (!isEligible) {
        return (
            <div
                ref={slotRef}
                className={shellClasses}
                style={{ minHeight }}
                data-testid={`ad-slot-${slotId}`}
                data-state="blocked"
            >
                <div className="flex min-h-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/80 px-4 text-center dark:border-slate-600 dark:bg-slate-800/60">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Sponsored content is shown after age confirmation and
                        cookie consent.
                    </p>
                </div>
            </div>
        )
    }

    if (!sponsor || !creative?.imageSrc) {
        return (
            <div
                ref={slotRef}
                className={shellClasses}
                style={{ minHeight }}
                data-testid={`ad-slot-${slotId}`}
                data-state="empty"
            >
                <div className="flex min-h-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/80 px-4 text-center dark:border-slate-600 dark:bg-slate-800/60">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Sponsor slot available
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div
            ref={slotRef}
            className={shellClasses}
            style={{ minHeight }}
            data-testid={`ad-slot-${slotId}`}
            data-state="active"
        >
            <div
                className={joinClasses(
                    'flex gap-4',
                    resolvedVariant === 'card'
                        ? 'flex-col'
                        : 'flex-col sm:flex-row sm:items-center'
                )}
            >
                <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                            {disclosureLabel}
                        </span>
                        <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {slotConfig?.label ?? 'Sponsor Placement'}
                        </span>
                    </div>
                    {/* rel is built dynamically but always includes noopener+noreferrer */}
                    {/* eslint-disable-next-line react/jsx-no-target-blank */}
                    <a
                        href={sponsor.destinationUrl}
                        target="_blank"
                        rel={buildPaidLinkRel(sponsor)}
                        onClick={handleClick}
                        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                        aria-label={`${disclosureLabel}: ${sponsor.name}`}
                    >
                        <img
                            src={creative.imageSrc}
                            alt={creative.alt}
                            width={creative.width}
                            height={creative.height}
                            loading={
                                slotId === 'home_mid_banner' ? 'eager' : 'lazy'
                            }
                            className={getImageClasses(resolvedVariant)}
                        />
                        <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                                    {sponsor.name}
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-300">
                                    Paid placement
                                </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white">
                                {sponsor.ctaText || 'Learn More'}
                            </span>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    )
}
