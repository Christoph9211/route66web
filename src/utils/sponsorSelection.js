import sponsorInventory from '../data/sponsors.js'

const SESSION_PICK_KEY_PREFIX = 'route66:sponsor-pick'

function getSafeSessionStorage() {
    if (typeof window === 'undefined') return null

    try {
        return window.sessionStorage
    } catch {
        return null
    }
}

function parseDateOnly(value) {
    if (typeof value !== 'string') return null

    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!match) return null

    const year = Number(match[1])
    const monthIndex = Number(match[2]) - 1
    const day = Number(match[3])

    const parsed = new Date(year, monthIndex, day)
    if (
        parsed.getFullYear() !== year ||
        parsed.getMonth() !== monthIndex ||
        parsed.getDate() !== day
    ) {
        return null
    }

    return parsed
}

function startOfDay(date) {
    const normalized = new Date(date)
    normalized.setHours(0, 0, 0, 0)
    return normalized
}

function normalizeWeight(value) {
    const numeric = Number(value)
    return Number.isFinite(numeric) && numeric > 0 ? numeric : 1
}

function normalizePriority(value) {
    const numeric = Number(value)
    return Number.isFinite(numeric) ? numeric : 0
}

function getCurrentPagePath(explicitPagePath) {
    if (typeof explicitPagePath === 'string' && explicitPagePath.length > 0) {
        return explicitPagePath
    }

    if (typeof window === 'undefined') return '/'
    return window.location.pathname || '/'
}

function getPickSessionKey(slotId, pagePath) {
    return `${SESSION_PICK_KEY_PREFIX}:${pagePath}:${slotId}`
}

function chooseWeightedSponsor(sponsors, randomFn = Math.random) {
    if (!Array.isArray(sponsors) || sponsors.length === 0) return null

    const totalWeight = sponsors.reduce(
        (sum, sponsor) => sum + normalizeWeight(sponsor.weight),
        0
    )

    if (!Number.isFinite(totalWeight) || totalWeight <= 0) {
        return sponsors[0]
    }

    let cursor = randomFn() * totalWeight

    for (const sponsor of sponsors) {
        cursor -= normalizeWeight(sponsor.weight)
        if (cursor <= 0) {
            return sponsor
        }
    }

    return sponsors[sponsors.length - 1]
}

export function isSponsorActive(sponsor, now = new Date()) {
    if (!sponsor || typeof sponsor !== 'object') return false
    if (sponsor.status !== 'active') return false

    const currentDay = startOfDay(now)
    const startDate = parseDateOnly(sponsor.startDate)
    const endDate = parseDateOnly(sponsor.endDate)

    if (!startDate || !endDate) return false
    if (startDate > endDate) return false

    return currentDay >= startDate && currentDay <= endDate
}

export function getEligibleSponsorsForSlot(
    slotId,
    now = new Date(),
    options = {}
) {
    const sponsors = Array.isArray(options.sponsors)
        ? options.sponsors
        : sponsorInventory

    const eligible = sponsors.filter(
        (sponsor) =>
            isSponsorActive(sponsor, now) &&
            Array.isArray(sponsor.placements) &&
            sponsor.placements.includes(slotId)
    )

    if (eligible.length === 0) return []

    const highestPriority = Math.max(
        ...eligible.map((sponsor) => normalizePriority(sponsor.priority))
    )

    return eligible.filter(
        (sponsor) => normalizePriority(sponsor.priority) === highestPriority
    )
}

export function pickSponsorForSlot(slotId, options = {}) {
    const now = options.now instanceof Date ? options.now : new Date()
    const pagePath = getCurrentPagePath(options.pagePath)
    const randomFn = typeof options.randomFn === 'function'
        ? options.randomFn
        : Math.random
    const sessionStorage = options.sessionStorage ?? getSafeSessionStorage()
    const sponsors = Array.isArray(options.sponsors)
        ? options.sponsors
        : sponsorInventory

    const eligibleSponsors = getEligibleSponsorsForSlot(slotId, now, {
        sponsors,
    })

    if (eligibleSponsors.length === 0) {
        if (sessionStorage) {
            sessionStorage.removeItem(getPickSessionKey(slotId, pagePath))
        }
        return null
    }

    const cacheKey = getPickSessionKey(slotId, pagePath)

    if (sessionStorage) {
        const cachedId = sessionStorage.getItem(cacheKey)
        if (cachedId) {
            const cachedSponsor = eligibleSponsors.find(
                (sponsor) => sponsor.id === cachedId
            )
            if (cachedSponsor) {
                return cachedSponsor
            }
        }
    }

    const selected = chooseWeightedSponsor(eligibleSponsors, randomFn)

    if (selected && sessionStorage) {
        sessionStorage.setItem(cacheKey, selected.id)
    }

    return selected
}
