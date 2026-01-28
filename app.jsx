import React from 'react'
import ReactDOM from 'react-dom/client'
import { businessInfo } from './src/utils/businessInfo.js'
import AgeGate from './src/components/AgeGate.jsx'
import ResponsiveImage from './src/components/ResponsiveImage.jsx'
// Font Awesome (SVG) – import only what we use
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faCannabis,
    faBars,
    faXmark,
    faFlask,
    faLeaf,
    faUsers,
    faStar as faStarSolid,
    faChevronUp,
} from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons'
import {
    faFacebook,
} from '@fortawesome/free-brands-svg-icons'

const StructuredData = React.lazy(() =>
    import('./src/components/StructuredData.jsx')
)
const LocalBusinessInfo = React.lazy(() =>
    import('./src/components/LocalBusinessInfo.jsx')
)
const LocationContent = React.lazy(() =>
    import('./src/components/LocationContent.jsx')
)
const GoogleBusinessIntegration = React.lazy(() =>
    import('./src/components/GoogleBusinessIntegration.jsx')
)
const LocalSEOFAQ = React.lazy(() =>
    import('./src/components/LocalSEOFAQ.jsx')
)
const Analytics = React.lazy(() =>
    import('@vercel/analytics/react').then((module) => ({
        default: module.Analytics,
    }))
)
const SpeedInsights = React.lazy(() =>
    import('@vercel/speed-insights/react').then((module) => ({
        default: module.SpeedInsights,
    }))
)

const DANGEROUS = new Set(['__proto__', 'prototype', 'constructor'])
const clean = (k) => (DANGEROUS.has(k) ? undefined : k)

const SIZE_GROUP_ORDER = {
    mass: 0,
    volume: 1,
    count: 2,
    unknown: 3,
}

const SIZE_UNIT_FACTORS = {
    mg: { group: 'mass', factor: 0.001 },
    g: { group: 'mass', factor: 1 },
    gram: { group: 'mass', factor: 1 },
    grams: { group: 'mass', factor: 1 },
    oz: { group: 'mass', factor: 28.3495 },
    ounce: { group: 'mass', factor: 28.3495 },
    ounces: { group: 'mass', factor: 28.3495 },
    lb: { group: 'mass', factor: 453.592 },
    lbs: { group: 'mass', factor: 453.592 },
    pound: { group: 'mass', factor: 453.592 },
    pounds: { group: 'mass', factor: 453.592 },
    ml: { group: 'volume', factor: 1 },
    milliliter: { group: 'volume', factor: 1 },
    milliliters: { group: 'volume', factor: 1 },
    l: { group: 'volume', factor: 1000 },
    liter: { group: 'volume', factor: 1000 },
    litre: { group: 'volume', factor: 1000 },
    liters: { group: 'volume', factor: 1000 },
    litres: { group: 'volume', factor: 1000 },
    ct: { group: 'count', factor: 1 },
    count: { group: 'count', factor: 1 },
    pack: { group: 'count', factor: 1 },
    pk: { group: 'count', factor: 1 },
    pcs: { group: 'count', factor: 1 },
    pieces: { group: 'count', factor: 1 },
}

const parseSizeOption = (value) => {
    if (typeof value !== 'string') {
        return { group: 'unknown', normalized: null }
    }

    const normalized = value.toLowerCase().replace(/,/g, '').trim()
    const fractionMatch = normalized.match(/(\d+)\s*\/\s*(\d+)/)
    const numberMatch = normalized.match(/(\d+(?:\.\d+)?)/)

    let numeric = null
    if (fractionMatch) {
        const numerator = Number(fractionMatch[1])
        const denominator = Number(fractionMatch[2])
        if (Number.isFinite(numerator) && Number.isFinite(denominator) && denominator !== 0) {
            numeric = numerator / denominator
        }
    } else if (numberMatch) {
        numeric = Number(numberMatch[1])
    }

    if (!Number.isFinite(numeric)) {
        return { group: 'unknown', normalized: null }
    }

    const unitMatch = normalized.match(
        /(mg|g|gram|grams|oz|ounce|ounces|lb|lbs|pound|pounds|ml|milliliter|milliliters|l|liter|litre|liters|litres|ct|count|pack|pk|pcs|pieces)/
    )
    const unit = unitMatch ? unitMatch[1] : null

    if (unit && SIZE_UNIT_FACTORS[unit]) {
        const { group, factor } = SIZE_UNIT_FACTORS[unit]
        return { group, normalized: numeric * factor }
    }

    if (fractionMatch && numeric > 0 && numeric <= 1) {
        return { group: 'mass', normalized: numeric * SIZE_UNIT_FACTORS.oz.factor }
    }

    return { group: 'unknown', normalized: numeric }
}

const sortSizeOptions = (options) => {
    if (!Array.isArray(options)) return []

    return options
        .map((size, index) => {
            const parsed = parseSizeOption(size)
            return {
                size,
                index,
                group: parsed.group ?? 'unknown',
                normalized: parsed.normalized,
            }
        })
        .sort((a, b) => {
            const groupA = SIZE_GROUP_ORDER[a.group] ?? SIZE_GROUP_ORDER.unknown
            const groupB = SIZE_GROUP_ORDER[b.group] ?? SIZE_GROUP_ORDER.unknown
            if (groupA !== groupB) return groupA - groupB

            const aHasValue = Number.isFinite(a.normalized)
            const bHasValue = Number.isFinite(b.normalized)
            if (aHasValue && bHasValue && a.normalized !== b.normalized) {
                return a.normalized - b.normalized
            }
            if (aHasValue !== bHasValue) {
                return aHasValue ? -1 : 1
            }

            const alpha = String(a.size).localeCompare(String(b.size), undefined, {
                numeric: true,
                sensitivity: 'base',
            })
            return alpha || a.index - b.index
        })
        .map(({ size }) => size)
}

const renderSectionSkeleton = (height = 'h-64') => (
    <div
        className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
        aria-hidden="true"
    >
        <div
            className={`animate-pulse rounded-2xl bg-gray-200/70 dark:bg-gray-700/40 ${height}`}
        />
    </div>
)

const toArray = (value) => {
    if (Array.isArray(value)) {
        return value.filter((entry) => entry != null)
    }
    return value != null ? [value] : []
}

const extractSizeFromName = (name) => {
    if (typeof name !== 'string') return null
    const match = name.match(/ - (.+)/)
    return match ? match[1] : null
}

const groupLegacyProducts = (rawProducts) => {
    const grouped = new Map()

    rawProducts.forEach((product) => {
        const name = product.name ?? product['name'] ?? ''
        const category = product.category ?? product['category'] ?? ''
        const key = `${name}|${category}`

        if (!grouped.has(key)) {
            grouped.set(key, {
                ...product,
                name,
                category,
                sizeSet: new Set(),
                prices: {},
                variantSet: new Set(),
                idsSet: new Set(),
                imageSet: new Set(),
                descriptionSet: new Set(),
                ratingSet: new Set(),
                urlSet: new Set(),
            })
        }

        const entry = grouped.get(key)

        toArray(product.id).forEach((id) => {
            entry.idsSet.add(id)
        })
        toArray(product.image).forEach((image) => {
            entry.imageSet.add(image)
        })
        toArray(product.description).forEach((description) => {
            entry.descriptionSet.add(description)
        })
        toArray(product.rating).forEach((rating) => {
            entry.ratingSet.add(rating)
        })
        toArray(product.url).forEach((url) => {
            entry.urlSet.add(url)
        })
        toArray(product.variants ?? product.variant).forEach((variant) => {
            entry.variantSet.add(variant)
        })

        if (
            Array.isArray(product.size_options) &&
            product.size_options.length &&
            product.prices &&
            typeof product.prices === 'object'
        ) {
            product.size_options.forEach((size) => {
                if (!size) return
                if (!entry.sizeSet.has(size)) {
                    entry.sizeSet.add(size)
                }
                const safeKey = clean(size)
                if (
                    safeKey &&
                    Object.prototype.hasOwnProperty.call(product.prices, size)
                ) {
                    entry.prices[safeKey] = product.prices[size]
                }
            })
        } else {
            const inferredSize = extractSizeFromName(name)
            if (inferredSize) {
                if (!entry.sizeSet.has(inferredSize)) {
                    entry.sizeSet.add(inferredSize)
                }
                const safeSize = clean(inferredSize)
                if (safeSize && product.price != null) {
                    entry.prices[safeSize] = product.price
                }
            }
        }
    })

    return Array.from(grouped.values()).map((entry) => {
        const {
            sizeSet,
            variantSet,
            idsSet,
            imageSet,
            descriptionSet,
            ratingSet,
            urlSet,
            ...rest
        } = entry
        return {
            ...rest,
            size_options: sortSizeOptions(Array.from(sizeSet)),
            variants: Array.from(variantSet),
            ids: Array.from(idsSet),
            images: Array.from(imageSet),
            descriptions: Array.from(descriptionSet),
            ratings: Array.from(ratingSet),
            urls: Array.from(urlSet),
        }
    })
}

const normalizeProducts = (rawProducts) => {
    if (!Array.isArray(rawProducts)) return []

    const isStructured = rawProducts.every(
        (product) =>
            Array.isArray(product.size_options) &&
            product.size_options.length &&
            product.prices &&
            typeof product.prices === 'object' &&
            Object.keys(product.prices).length
    )

    if (!isStructured) {
        return groupLegacyProducts(rawProducts)
    }

    // Fast path: modern exports already include normalized sizes/prices.
    return rawProducts.map((product) => ({
        ...product,
        size_options: sortSizeOptions(
            Array.isArray(product.size_options)
                ? [...product.size_options]
                : toArray(product.size_options)
        ),
        prices:
            product.prices && typeof product.prices === 'object'
                ? { ...product.prices }
                : {},
        variants: toArray(product.variants ?? product.variant),
        ids: toArray(product.ids ?? product.id),
        images: toArray(product.images ?? product.image),
        descriptions: toArray(product.descriptions ?? product.description),
        ratings: toArray(product.ratings ?? product.rating),
        urls: toArray(product.urls ?? product.url),
    }))
}

const buildCategories = (products) =>
    [
        ...new Set(
            products.map((product) => product.category).filter(Boolean)
        ),
    ]
        .map((category) => {
            const name = category
                .replace(/-/g, ' ')
                .replace(/\b\w/g, (match) => match.toUpperCase())
                .trim()
                .replace(/\s+/g, ' ')

            const categoryId = slugify(category)

            if (!categoryId) return null

            return { id: categoryId, name }
        })
        .filter(Boolean)

const generateProductAlt = (product) => {
    if (!product || typeof product !== 'object') {
        return 'Premium hemp product available at Route 66 Hemp in St Robert, Missouri'
    }

    const segments = []

    if (product.name) {
        segments.push(product.name)
    }

    if (product.category) {
        segments.push(product.category)
    }

    if (product.thca_percentage) {
        segments.push(`${product.thca_percentage}% THCa`)
    }

    segments.push('Premium Hemp Product at Route 66 Hemp, St Robert, Missouri')

    return segments.join(' - ')
}


export default function App() {
    const [appState, setAppState] = React.useState({
        isMobileMenuOpen: false,
        selectedCategory: 'all',
        products: [],
        categories: [],
        loading: false,
        shouldLoadProducts: false,
        hasLoadedProducts: false,
        catalogRequestVersion: 0,
        loadError: null,
    })
    const [isFiltering, startFiltering] = React.useTransition()
    const [visibleCount, setVisibleCount] = React.useState(PRODUCTS_PAGE_SIZE)

    const [structuredDataState, setStructuredDataState] = React.useState({
        products: [],
        hasLoaded: false,
    })

    const productCatalogPromiseRef = React.useRef(null)

    const fetchProductCatalog = React.useCallback(async () => {
        if (!productCatalogPromiseRef.current) {
            productCatalogPromiseRef.current = fetch('products/products.json')
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch products')
                    }
                    return response.json()
                })
                .then((productsData) => {
                    const normalizedProducts = normalizeProducts(productsData)
                    const categories = buildCategories(normalizedProducts)

                    return {
                        products: normalizedProducts,
                        categories,
                    }
                })
                .catch((error) => {
                    productCatalogPromiseRef.current = null
                    throw error
                })
        }

        return productCatalogPromiseRef.current
    }, [])

    const requestProductCatalog = React.useCallback(
        (options = {}) => {
            const { forceRetry = false } = options

            setAppState((prevState) => {
                if (prevState.hasLoadedProducts) {
                    if (prevState.shouldLoadProducts) {
                        return prevState
                    }

                    return { ...prevState, shouldLoadProducts: true }
                }

                if (!prevState.shouldLoadProducts) {
                    return {
                        ...prevState,
                        shouldLoadProducts: true,
                        catalogRequestVersion:
                            prevState.catalogRequestVersion + 1,
                        loadError: null,
                    }
                }

                if (forceRetry || prevState.loadError) {
                    return {
                        ...prevState,
                        catalogRequestVersion:
                            prevState.catalogRequestVersion + 1,
                        loadError: null,
                    }
                }

                return prevState
            })
        },
        []
    )

    React.useEffect(() => {
        if (typeof window === 'undefined') {
            return
        }

        if (window.location.hash === '#products') {
            requestProductCatalog()
        }
    }, [requestProductCatalog])

    const { shouldLoadProducts, hasLoadedProducts, catalogRequestVersion } =
        appState

    React.useEffect(() => {
        if (
            !shouldLoadProducts ||
            hasLoadedProducts ||
            catalogRequestVersion === 0
        ) {
            return undefined
        }

        let isCancelled = false

        setAppState((prevState) =>
            prevState.loading
                ? prevState
                : { ...prevState, loading: true }
        )

        const loadProducts = async () => {
            try {
                const { products: normalizedProducts, categories } =
                    await fetchProductCatalog()

                if (isCancelled) return

                setAppState((prevState) => ({
                    ...prevState,
                    categories,
                    products: normalizedProducts,
                    loading: false,
                    hasLoadedProducts: true,
                    loadError: null,
                }))
            } catch (error) {
                console.error('Error loading products:', error)
                if (isCancelled) return
                setAppState((prevState) => ({
                    ...prevState,
                    loading: false,
                    loadError:
                        'Unable to load the product catalog. Please try again.',
                }))
            }
        }

        loadProducts()

        return () => {
            isCancelled = true
        }
    }, [
        shouldLoadProducts,
        hasLoadedProducts,
        catalogRequestVersion,
        fetchProductCatalog,
    ])

    React.useEffect(() => {
        let isCancelled = false

        const preloadStructuredData = async () => {
            try {
                const { products: normalizedProducts } =
                    await fetchProductCatalog()

                if (isCancelled) return

                setStructuredDataState((prevState) => {
                    if (prevState.hasLoaded) {
                        return prevState
                    }

                    return {
                        products: normalizedProducts,
                        hasLoaded: true,
                    }
                })
            } catch (error) {
                console.error(
                    'Error preloading products for structured data:',
                    error
                )
            }
        }

        preloadStructuredData()

        return () => {
            isCancelled = true
        }
    }, [fetchProductCatalog])

    const handleNavigation = (e, targetId) => {
        e.preventDefault()

        setAppState((prevState) =>
            prevState.isMobileMenuOpen
                ? { ...prevState, isMobileMenuOpen: false }
                : prevState
        )

        if (targetId === 'products') {
            requestProductCatalog()
        }
        if (targetId) {
            document
                .getElementById(targetId)
                ?.scrollIntoView({ behavior: 'smooth' })
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
        window.history.replaceState(null, '', window.location.pathname)
    }

    const structuredDataProducts = React.useMemo(() => {
        if (appState.hasLoadedProducts) {
            return appState.products
        }

        return structuredDataState.hasLoaded
            ? structuredDataState.products
            : []
    }, [
        appState.hasLoadedProducts,
        appState.products,
        structuredDataState.hasLoaded,
        structuredDataState.products,
    ])

    const filteredProducts = React.useMemo(() => {
        if (appState.selectedCategory === 'all') {
            return appState.products
        }
        return appState.products.filter(
            (product) =>
                slugify(product.category) === appState.selectedCategory
        )
    }, [appState.products, appState.selectedCategory])
    const deferredProducts = React.useDeferredValue(filteredProducts)
    const visibleProducts = React.useMemo(
        () => deferredProducts.slice(0, visibleCount),
        [deferredProducts, visibleCount]
    )

    React.useEffect(() => {
        setVisibleCount(PRODUCTS_PAGE_SIZE)
    }, [appState.selectedCategory, deferredProducts.length])

    const handleCategorySelect = React.useCallback((categoryId) => {
        startFiltering(() => {
            setAppState((prevState) =>
                prevState.selectedCategory === categoryId
                    ? prevState
                    : { ...prevState, selectedCategory: categoryId }
            )
        })
    }, [startFiltering])

    return (
        <div className="flex min-h-screen flex-col">
            <div id="home"></div>
            <React.Suspense fallback={null}>
                <StructuredData
                    pageMode="listing"
                    products={structuredDataProducts}
                />
            </React.Suspense>
            <AgeGate />
            {/* Navigation */}
            <nav
                role="navigation"
                className="sticky top-0 z-50 bg-white/90 shadow-md md:backdrop-blur dark:bg-gray-900/90"
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex items-center">
                            <div className="flex shrink-0 items-center">
                                {/* Logo */}
                                <div className="mr-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                                    <FontAwesomeIcon
                                        icon={faCannabis}
                                        className="text-white"
                                        aria-hidden="true"
                                    />
                                </div>
                                <span
                                    className="text-xl font-bold text-gray-900 dark:text-white"
                                    itemProp="name"
                                >
                                    {businessInfo.name}
                                </span>
                            </div>
                        </div>
                        {/* Desktop menu */}
                        <div className="hidden md:flex md:items-center md:space-x-6">
                            <a
                                href="#home"
                                onClick={(e) => handleNavigation(e)}
                                className="px-3 py-2 text-sm font-medium text-gray-900 transition duration-150 hover:text-emerald-600 dark:text-white"
                            >
                                Home
                            </a>
                            <a
                                href="#products"
                                onClick={(e) => handleNavigation(e, 'products')}
                                className="px-3 py-2 text-sm font-medium text-gray-900 transition duration-150 hover:text-emerald-600 dark:text-white"
                            >
                                Products
                            </a>
                            <a
                                href="#about"
                                onClick={(e) => handleNavigation(e, 'about')}
                                className="px-3 py-2 text-sm font-medium text-gray-900 transition duration-150 hover:text-emerald-600 dark:text-white"
                            >
                                About
                            </a>
                            <a
                                href="#contact"
                                onClick={(e) => handleNavigation(e, 'contact')}
                                className="px-3 py-2 text-sm font-medium text-gray-900 transition duration-150 hover:text-emerald-600 dark:text-white"
                            >
                                Contact
                            </a>
                        </div>
                        {/* Mobile menu button */}
                        <div className="flex items-center md:hidden">
                            <button
                                type="button"
                                onClick={() =>
                                    setAppState((prevState) => ({
                                        ...prevState,
                                        isMobileMenuOpen:
                                            !prevState.isMobileMenuOpen,
                                    }))
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-900 hover:text-emerald-600 focus:outline-none dark:text-emerald-500"
                                aria-label={
                                    appState.isMobileMenuOpen
                                        ? 'Close main menu'
                                        : 'Open main menu'
                                }
                                aria-expanded={
                                    appState.isMobileMenuOpen ? 'true' : 'false'
                                }
                            >
                                <FontAwesomeIcon
                                    icon={
                                        appState.isMobileMenuOpen
                                            ? faXmark
                                            : faBars
                                    }
                                    className="text-xl"
                                    aria-hidden="true"
                                />
                            </button>
                        </div>
                    </div>
                </div>
                {appState.isMobileMenuOpen && (
                    <div className="md:hidden">
                        <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                            <a
                                href="#home"
                                onClick={(e) => handleNavigation(e)}
                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:text-emerald-600 dark:text-white"
                            >
                                Home
                            </a>
                            <a
                                href="#products"
                                onClick={(e) => handleNavigation(e, 'products')}
                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:text-emerald-600 dark:text-white"
                            >
                                Products
                            </a>
                            <a
                                href="#about"
                                onClick={(e) => handleNavigation(e, 'about')}
                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:text-emerald-600 dark:text-white"
                            >
                                About
                            </a>
                            <a
                                href="#contact"
                                onClick={(e) => handleNavigation(e, 'contact')}
                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:text-emerald-600 dark:text-white"
                            >
                                Contact
                            </a>
                        </div>
                    </div>
                )}
            </nav>
            <section>
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-linear-to-r from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                    <div className="mx-auto max-w-7xl">
                        <div className="relative z-10 bg-linear-to-r from-white via-gray-50 to-gray-100 pb-8 sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                            <div className="pt-10 sm:pt-16 lg:overflow-hidden lg:pb-14 lg:pt-8">
                                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                    <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                                        <div className="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 sm:text-center lg:flex lg:items-center lg:px-0 lg:text-left">
                                            <div className="lg:py-24">
                                                <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:mt-5 sm:text-6xl lg:mt-6 xl:text-6xl dark:text-white">
                                                    <span>
                                                        Premium Hemp Products
                                                    </span>
                                                    <span className="block text-emerald-600 dark:text-emerald-500">
                                                        For Your Wellness
                                                    </span>
                                                </h1>
                                                <p className="mt-3 text-base text-gray-700 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl dark:text-white">
                                                    Discover our range of
                                                    high-quality, lab-tested
                                                    hemp products. From THCa flower
                                                    to edibles, we have
                                                    everything you need for a
                                                    balanced lifestyle.
                                                </p>
                                                <div className="mt-10 flex justify-center space-x-4 sm:mt-12 lg:justify-start">
                                                    <div className="flex gap-4">
                                                        <a href="#products" onClick={(e) => handleNavigation(e, 'products')} className="flex-1 flex h-full items-center justify-center rounded-md bg-emerald-600 p-4 font-bold text-white text-lg md:text-xl text-center leading-tight min-h-22 md:min-h-24 shadow-lg transition-transform hover:scale-105"> Explore Products </a>
                                                        <a href="#about" onClick={(e) => handleNavigation(e, 'about')} className="flex-1 flex h-full items-center justify-center rounded-md bg-emerald-500 p-4 font-bold text-white text-lg md:text-xl text-center leading-tight min-h-22 md:min-h-24 shadow-lg transition-transform hover:scale-105"> Learn more about us </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-12 lg:relative lg:m-0">
                                            <div className="mx-auto mt-12 max-w-md sm:max-w-2xl lg:mt-0">
                                                <ResponsiveImage
                                                    src="/assets/images/route-66-hemp-storefront-st-robert"
                                                    alt="Route 66 Hemp storefront showcasing premium hemp products in St Robert, Missouri"
                                                    width={1280}
                                                    height={720}
                                                    className="w-full overflow-hidden rounded-xl shadow-xl"
                                                    sizes="(max-width: 640px) min(28rem, calc(100vw - 2rem - 2px)), (max-width: 1024px) min(42rem, calc(100vw - 3rem)), min(39rem, calc(50vw - 3rem))"
                                                    srcSetWidths={[320, 400, 640, 760, 768, 1024, 1280, 1600, 1920]}
                                                    priority
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Products Section */}
                <div id="products" className="bg-white py-12 dark:bg-gray-800">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-8 lg:text-center">
                            <h2 className="text-base font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                                Products
                            </h2>
                            <p className="mt-2 text-3xl font-extrabold leading-8 tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                                Explore Our Collection
                            </p>
                            <p className="mt-4 max-w-2xl text-xl text-gray-700 lg:mx-auto dark:text-white">
                                Our products are lab tested for quality and
                                purity.
                            </p>
                        </div>
                        {appState.shouldLoadProducts ? (
                            <>
                                <div
                                    className="mb-8 flex flex-wrap justify-center gap-2"
                                    role="group"
                                    aria-label="Filter products by category"
                                >
                                    <button
                                        onClick={() => handleCategorySelect('all')}
                                        aria-pressed={
                                            appState.selectedCategory === 'all'
                                        }
                                        aria-label="Show all products"
                                        className={`rounded-full px-4 py-2 text-sm font-medium ${appState.selectedCategory === 'all'
                                            ? 'bg-emerald-600 text-white dark:bg-emerald-600'
                                            : 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500'
                                            }`}
                                    >
                                        All Products
                                    </button>
                                    {appState.categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => handleCategorySelect(category.id)}
                                            aria-pressed={
                                                appState.selectedCategory ===
                                                category.id
                                            }
                                            aria-label={`Filter by ${category.name}`}
                                            className={`rounded-full px-4 py-2 text-sm font-medium ${appState.selectedCategory ===
                                                category.id
                                                ? 'bg-emerald-600 text-white dark:bg-emerald-600' // <-- force high contrast
                                                : 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500'
                                                }`}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                                {appState.loading ? (
                                    <div className="col-span-full flex items-center justify-center py-12">
                                        <div className="leaf-loader">
                                            <FontAwesomeIcon
                                                icon={faCannabis}
                                                className="text-5xl text-emerald-600 dark:text-emerald-500"
                                                aria-hidden="true"
                                            />
                                        </div>
                                        <span className="sr-only">
                                            Loading products...
                                        </span>
                                    </div>
                                ) : appState.loadError ? (
                                    <div
                                        role="alert"
                                        aria-live="assertive"
                                        className="col-span-full max-w-xl rounded-2xl border border-emerald-100 bg-emerald-50 p-8 text-center text-emerald-900 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-900/30 dark:text-emerald-100"
                                    >
                                        <h3 className="text-lg font-semibold">We couldn&apos;t load the menu</h3>
                                        <p className="mt-3 text-sm">
                                            {appState.loadError}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                requestProductCatalog({
                                                    forceRetry: true,
                                                })
                                            }
                                            className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-50 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:focus-visible:ring-offset-transparent"
                                        >
                                            Try again
                                        </button>
                                    </div>
                                ) : deferredProducts.length > 0 ? (
                                    <>
                                        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                                            {visibleProducts.map((product) => (
                                                <ProductCard
                                                    key={product.name + product.category}
                                                    product={product}
                                                />
                                            ))}
                                        </div>
                                        {deferredProducts.length >
                                        visibleProducts.length ? (
                                            <div className="mt-10 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        startFiltering(() =>
                                                            setVisibleCount(
                                                                (count) =>
                                                                    count +
                                                                    PRODUCTS_PAGE_SIZE
                                                            )
                                                        )
                                                    }
                                                    className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 dark:border-emerald-700/60 dark:bg-gray-900 dark:text-emerald-200 dark:hover:bg-gray-800"
                                                >
                                                    Load more products
                                                </button>
                                                <p className="mt-3 text-xs text-gray-500 dark:text-gray-300">
                                                    Showing {visibleProducts.length} of{' '}
                                                    {deferredProducts.length}
                                                </p>
                                            </div>
                                        ) : null}
                                    </>
                                ) : (
                                    <div className="col-span-full py-12 text-center">
                                        <p className="text-gray-700 dark:text-white">
                                            Products Coming Soon
                                        </p>
                                    </div>
                                )}
                                {isFiltering && (
                                    <div
                                        className="mt-6 text-center text-sm text-gray-500 dark:text-gray-300"
                                        aria-live="polite"
                                    >
                                        Updating products...
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="mx-auto max-w-2xl rounded-2xl bg-linear-to-r from-emerald-600 to-emerald-500 p-8 text-center shadow-lg dark:from-emerald-700 dark:to-emerald-600">
                                <p className="text-lg font-semibold text-white">
                                    Ready to explore our latest THCa flower, edibles, and concentrates?
                                </p>
                                <p className="mt-2 text-sm text-emerald-50">
                                    Tap the button below when you&apos;re ready and we&apos;ll load the freshest menu straight from our shelves.
                                </p>
                                <button
                                    type="button"
                                    onClick={requestProductCatalog}
                                    className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-600 dark:text-emerald-700"
                                >
                                    View Products
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                {/* About Section */}
                <div id="about" className="bg-white py-12 dark:bg-gray-800">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-10 lg:text-center">
                            <h2 className="text-base font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                                About Us
                            </h2>
                            <p className="mt-2 text-3xl font-extrabold leading-8 tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                                Our Story
                            </p>
                        </div>
                        <div className="mt-10">
                            <div className="items-center lg:grid lg:grid-cols-2 lg:gap-8">
                                <div className="relative lg:col-start-2 lg:row-start-1">
                                    <div className="relative mx-auto text-base lg:max-w-none">
                                        <div className="aspect-w-2 aspect-h-1 overflow-hidden rounded-lg shadow-xl">
                                            <div className="flex h-full w-full items-center justify-center bg-linear-to-r from-green-800 to-green-600 p-6">
                                                <div className="text-center text-white">
                                                    <FontAwesomeIcon
                                                        icon={faLeaf}
                                                        className="mb-4 text-6xl"
                                                        aria-hidden="true"
                                                    />
                                                    <h3 className="mb-2 text-2xl font-bold">
                                                        From Seed to Sale
                                                    </h3>
                                                    <p className="text-lg">
                                                        We control every step of
                                                        the process to ensure
                                                        the highest quality
                                                        products
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-10 lg:col-start-1 lg:row-start-1 lg:mt-0">
                                    <div className="mx-auto max-w-prose text-base lg:max-w-none">
                                        <p className="text-lg text-gray-700 dark:text-white">
                                            Founded in 2025, Route 66 Hemp
                                            started with a simple mission: to
                                            provide high-quality hemp products
                                            that enhance people’s well-being
                                            while promoting sustainable
                                            agricultural practices.
                                        </p>
                                        <div className="prose prose-indigo dark:prose-invert mt-5 text-gray-700 dark:text-white">
                                            <p>
                                                Our team of experts carefully
                                                selects the finest hemp strains
                                                and works closely with local
                                                farmers who share our commitment
                                                to organic growing methods and
                                                environmental stewardship.
                                            </p>
                                            <p>
                                                We pride ourselves on
                                                transparency. All our products
                                                undergo rigorous third-party
                                                testing to ensure purity,
                                                potency, and safety. The test
                                                results are readily available to
                                                our customers, giving you peace
                                                of mind with every purchase.
                                            </p>
                                            <p>
                                                At Route 66 Hemp, we’re a
                                                community of hemp enthusiasts
                                                and wellness advocates dedicated
                                                to educating and empowering
                                                individuals to make informed
                                                choices about their health and
                                                wellness journey.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Features */}
                        <div className="mt-16">
                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="pt-6">
                                    <div className="flow-root rounded-lg bg-white px-6 pb-8 shadow-lg dark:bg-gray-800">
                                        <div className="-mt-6">
                                            <div>
                                                <span className="inline-flex items-center justify-center rounded-md bg-green-500 p-3 shadow-lg">
                                                    <FontAwesomeIcon
                                                        icon={faFlask}
                                                        className="text-xl text-white"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                            </div>
                                            <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900 dark:text-white">
                                                Lab Tested
                                            </h3>
                                            <p className="mt-5 text-base text-gray-700 dark:text-white">
                                                All our products are tested by
                                                third-party labs for potency,
                                                pesticides, and purity to ensure
                                                you get only the highest
                                                quality.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-6">
                                    <div className="flow-root rounded-lg bg-white px-6 pb-8 shadow-lg dark:bg-gray-800">
                                        <div className="-mt-6">
                                            <div>
                                                <span className="inline-flex items-center justify-center rounded-md bg-green-500 p-3 shadow-lg">
                                                    <FontAwesomeIcon
                                                        icon={faLeaf}
                                                        className="text-xl text-white"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                            </div>
                                            <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900 dark:text-white">
                                                Organically Grown
                                            </h3>
                                            <p className="mt-5 text-base text-gray-700 dark:text-white">
                                                Our hemp is grown free from
                                                harmful pesticides and
                                                chemicals, resulting in a
                                                cleaner, better product.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-6">
                                    <div className="flow-root rounded-lg bg-white px-6 pb-8 shadow-lg dark:bg-gray-800">
                                        <div className="-mt-6">
                                            <div>
                                                <span className="inline-flex items-center justify-center rounded-md bg-green-500 p-3 shadow-lg">
                                                    <FontAwesomeIcon
                                                        icon={faUsers}
                                                        className="text-xl text-white"
                                                        aria-hidden="true"
                                                    />
                                                </span>
                                            </div>
                                            <h3 className="mt-8 text-lg font-medium tracking-tight text-gray-900 dark:text-white">
                                                Expert Guidance
                                            </h3>
                                            <p className="mt-5 text-base text-gray-700 dark:text-white">
                                                Our knowledgeable staff is here
                                                to help you find the right
                                                products for your specific needs
                                                and answer any questions.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Location Content */}
                <React.Suspense fallback={renderSectionSkeleton('h-72')}>
                    <LocationContent />
                </React.Suspense>
                {/* Google Business Integration */}
                <React.Suspense fallback={renderSectionSkeleton('h-80')}>
                    <GoogleBusinessIntegration />
                </React.Suspense>
                {/* Local SEO FAQ */}
                <div id="faq">
                    <React.Suspense fallback={renderSectionSkeleton('h-72')}>
                        <LocalSEOFAQ />
                    </React.Suspense>
                </div>
                {/* Contact Section */}
                <div id="contact" className="bg-white py-12 dark:bg-gray-800">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-10 lg:text-center">
                            <h2 className="text-base font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                                Contact Us
                            </h2>
                            <p className="mt-2 text-3xl font-extrabold leading-8 tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                                Get In Touch
                            </p>
                            <p className="mt-4 max-w-2xl text-xl text-gray-700 lg:mx-auto dark:text-white">
                                Have questions? We’re here to help!
                            </p>
                        </div>
                        <div
                            id="store-info"
                            className="mt-10 flex justify-center"
                        >
                            <div className="lg:w-1/2">
                                <React.Suspense
                                    fallback={renderSectionSkeleton('h-96')}
                                >
                                    <LocalBusinessInfo />
                                </React.Suspense>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Footer */}
            <footer
                role="contentinfo"
                className="relative overflow-hidden bg-linear-to-r from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
            >
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                    <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                        <div className="space-y-8 xl:col-span-1">
                            <div className="flex items-center">
                                <div className="mr-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                                    <FontAwesomeIcon
                                        icon={faCannabis}
                                        className="text-white"
                                        aria-hidden="true"
                                    />
                                </div>
                                <span className="text-xl font-bold text-black dark:text-white">
                                    {businessInfo.name}
                                </span>
                            </div>
                            <p className="text-base text-black dark:text-white">
                                Premium hemp products for your wellness journey.
                                Quality you can trust.
                            </p>
                            <div className="flex space-x-6">
                                <a
                                    href="https://www.facebook.com/route66hemp/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-black hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400"
                                    aria-label="Facebook"
                                >
                                    <FontAwesomeIcon
                                        icon={faFacebook}
                                        className="text-xl"
                                        aria-hidden="true"
                                    />
                                    <span className="sr-only">Facebook</span>
                                </a>
                            </div>
                        </div>
                        <div className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4 xl:col-span-2 xl:mt-0">
                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white">
                                    Products
                                </h3>
                                <ul className="mt-4 space-y-4">
                                    <li>
                                        <a
                                            href="#products"
                                            onClick={(e) => handleNavigation(e, 'products')}
                                            className="text-base text-black hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400"
                                        >
                                            Edibles
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#products"
                                            onClick={(e) => handleNavigation(e, 'products')}
                                            className="text-black text-base hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400"
                                        >
                                            Concentrates
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#products"
                                            onClick={(e) => handleNavigation(e, 'products')}
                                            className="text-base text-black hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400"
                                        >
                                            Flower
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div className="mt-12 md:mt-0">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white">
                                    Company
                                </h3>
                                <ul className="mt-4 space-y-4">
                                    <li>
                                        <a
                                            href="#about"
                                            onClick={(e) => handleNavigation(e, 'about')}
                                            className="text-base text-black hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400"
                                        >
                                            About Us
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div className="mt-12 md:mt-0">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white">
                                    Support
                                </h3>
                                <ul className="mt-4 space-y-4">
                                    <li>
                                        <a
                                            href="#contact"
                                            onClick={(e) => handleNavigation(e, 'contact')}
                                            className="text-base text-black hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400"
                                        >
                                            Contact Us
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#faq"
                                            onClick={(e) => handleNavigation(e, 'faq')}
                                            className="text-base text-black hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400"
                                        >
                                            FAQs
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div className="mt-12 md:mt-0">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white">
                                    Legal
                                </h3>
                                <ul className="mt-4 space-y-4">
                                    <li>
                                        <a
                                            href="/privacy-policy/"
                                            className="text-base text-black hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400"
                                            title="Privacy Policy"
                                        >
                                            Privacy Policy
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="/terms-of-service/"
                                            className="text-base text-black hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400"
                                        >
                                            Terms and Conditions
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="/cookie-policy/"
                                            className="text-base text-black hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400"
                                            title="Cookie Policy"
                                        >
                                            Cookie Policy
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 border-t border-gray-700 pt-8">
                        <p className="text-center text-base text-black dark:text-white">
                            &copy; 2025 {businessInfo.name}. All rights
                            reserved.
                        </p>
                        <p className="mt-2 text-center text-sm text-black dark:text-white">
                            All products contain less than 0.3% THC and are
                            legal under the 2018 Farm Bill.
                        </p>
                        <div className="mt-4 text-center">
                            <React.Suspense
                                fallback={
                                    <span
                                        className="inline-block h-4 w-48 animate-pulse rounded bg-gray-200/70 dark:bg-gray-700/40"
                                        aria-hidden="true"
                                    />
                                }
                            >
                                <LocalBusinessInfo
                                    variant="inline"
                                    className="text-sm text-black dark:text-white"
                                />
                            </React.Suspense>
                        </div>
                    </div>
                </div>
            </footer>
            {/* ... */}
            <React.Suspense fallback={null}>
                <Analytics />
            </React.Suspense>
            {/* ... */}
            <React.Suspense fallback={null}>
                <SpeedInsights />
            </React.Suspense>
            {/* Back to top button */}
            <BackToTopButton />
        </div>
    )
}

const BackToTopButton = React.memo(function BackToTopButton() {
    const [visible, setVisible] = React.useState(false)
    const rafIdRef = React.useRef(null)
    const lastVisibleRef = React.useRef(false)

    React.useEffect(() => {
        if (typeof window === 'undefined') {
            return undefined
        }

        const updateVisibility = () => {
            rafIdRef.current = null
            const nextVisible = window.scrollY > 400
            if (lastVisibleRef.current !== nextVisible) {
                lastVisibleRef.current = nextVisible
                setVisible(nextVisible)
            }
        }

        const handleScroll = () => {
            if (rafIdRef.current != null) {
                return
            }
            rafIdRef.current = window.requestAnimationFrame(updateVisibility)
        }

        updateVisibility()
        window.addEventListener('scroll', handleScroll, { passive: true })

        return () => {
            window.removeEventListener('scroll', handleScroll)
            if (rafIdRef.current != null) {
                window.cancelAnimationFrame(rafIdRef.current)
            }
        }
    }, [])

    if (!visible) return null

    return (
        <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition-all duration-300 hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            aria-label="Back to top"
        >
            <FontAwesomeIcon
                icon={faChevronUp}
                className="text-xl"
                aria-hidden="true"
            />
        </button>
    )
})

BackToTopButton.displayName = 'BackToTopButton'

// ProductCard component for displaying product with size dropdown and dynamic price
function slugify(str = '') {
    return String(str)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}


const getPlaceholderForCategory = (category) => {
    switch (category) {
        case 'Flower':
            return '/assets/images/route-66-hemp-flower-placeholder'
        case 'Edibles':
            return '/assets/images/route-66-hemp-edibles-placeholder'
        case 'Concentrates':
            return '/assets/images/route-66-hemp-concentrates-placeholder'
        case 'Vapes & Carts':
            return '/assets/images/route-66-hemp-vapes-placeholder'
        case 'Diamonds & Sauce':
            return '/assets/images/route-66-hemp-diamonds-placeholder'
        default:
            return '/assets/images/route-66-hemp-product-placeholder'
    }
}

const PRODUCTS_PAGE_SIZE = 12

const ProductCard = React.memo(function ProductCard({ product }) {
    // Generate combined options if both flavors and size_options exist
    const combinedOptions = React.useMemo(() => {
        if (
            product.flavors &&
            product.flavors.length > 0 &&
            product.size_options &&
            product.size_options.length > 0
        ) {
            // Combine each flavor with each size option
            return product.flavors.flatMap((flavor) =>
                product.size_options.map((size) => ({
                    label: `${flavor} - ${size}`,
                    flavor,
                    size,
                }))
            )
        }
        return []
    }, [product.flavors, product.size_options])

    // State for combined selection
    const [selectedCombo, setSelectedCombo] = React.useState(
        combinedOptions.length > 0 ? combinedOptions[0] : null
    )
    // Fallback for only size or only flavor
    const [selectedSize, setSelectedSize] = React.useState(
        !combinedOptions.length &&
            product.size_options &&
            product.size_options.length > 0
            ? product.size_options[0]
            : null
    )
    const [selectedFlavor, setSelectedFlavor] = React.useState(
        !combinedOptions.length && product.flavors && product.flavors.length > 0
            ? product.flavors[0]
            : null
    )

    // Determine price
    let price = product.price
    if (combinedOptions.length > 0 && selectedCombo) {
        // If we have combined options, check if the price is defined for the selected size
        if (
            product.prices &&
            product.prices[selectedCombo.size] !== undefined
        ) {
            price = product.prices[selectedCombo.size]
        }
    } else if (
        selectedSize &&
        product.prices &&
        product.prices[selectedSize] !== undefined
    ) {
        // If we have a selected size, check if the price is defined for that size
        price = product.prices[selectedSize]
    } else if (!selectedSize && selectedFlavor && product.price) {
        // If we have a selected flavor but no selected size, use the default price
        price = product.price
    }

    // Determine banner based on selected variant
    let banner = product.banner
    let bannerKey = null
    if (combinedOptions.length > 0 && selectedCombo) {
        bannerKey = selectedCombo.label
    } else if (selectedSize) {
        bannerKey = selectedSize
    } else if (selectedFlavor) {
        bannerKey = selectedFlavor
    }
    if (bannerKey && product.availability) {
        if (product.availability[bannerKey]) {
            banner = product.availability[bannerKey]
        } else if (selectedCombo && product.availability[selectedCombo.size]) {
            banner = product.availability[selectedCombo.size]
        } else if (selectedFlavor && product.availability[selectedFlavor]) {
            banner = product.availability[selectedFlavor]
        } else if (selectedSize && product.availability[selectedSize]) {
            banner = product.availability[selectedSize]
        }
    }

    // Render a product card with the given product data
    // This component is complicated because it needs to handle three different cases:
    // 1. The product has both flavors and size options
    // 2. The product has only flavors
    // 3. The product has only size options
    // It also needs to dynamically calculate the price based on the selected flavor and size
    return (
        <div
            id={`product-${slugify(product.category)}-${slugify(product.name)}`}
            className="product-card group relative rounded-lg bg-white p-4 shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-gray-700"
        // This class is for the card shadow effect
        >
            {banner && (
                <div className="product-banner" aria-label={banner}>
                    {banner}
                </div>
            )}
            <ResponsiveImage
                src={
                    product.image ||
                    (Array.isArray(product.images) && product.images[0]) ||
                    getPlaceholderForCategory(product.category)
                }

                alt={generateProductAlt(product)}
                width={400}
                height={400}
                className="h-50 mb-4 w-full rounded-md object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {product.name}
            </h3>
            <p className="mt-1 text-sm font-semibold text-black dark:text-white">
                {product.category}
            </p>
            <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-white">
                {product.description ||
                    (product.descriptions && product.descriptions[0])}
            </p>
            {/* Combined dropdown for flavor + size */}
            {combinedOptions.length > 0 && (
                <div className="mt-2">
                    <label
                        htmlFor={`combo-${product.name}`}
                        className="mb-1 block text-xs font-semibold text-black dark:text-white"
                    >
                        Flavor & Size:
                    </label>
                    <select
                        id={`combo-${product.name}`}
                        className="w-full rounded border border-gray-300 p-2 dark:bg-gray-800 dark:text-white"
                        value={selectedCombo ? selectedCombo.label : ''}
                        onChange={(e) => {
                            // When the user selects a new option, update the selectedCombo state
                            const combo = combinedOptions.find(
                                (opt) => opt.label === e.target.value
                            )
                            setSelectedCombo(combo)
                        }}
                        aria-label="Select flavor and size"
                    >
                        {combinedOptions.map((opt) => (
                            <option key={opt.label} value={opt.label}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            {/* Size dropdown (if no flavors) */}
            {!combinedOptions.length &&
                product.size_options &&
                product.size_options.length > 0 && (
                    <div className="mt-2">
                        <label
                            htmlFor={`size-${product.name}`}
                            className="mb-1 block text-xs font-semibold text-black dark:text-white"
                        >
                            {/* Use 'Strain' for Vapes & Carts and Other, otherwise 'Size' */}
                            {['Vapes & Carts', 'Other'].includes(
                                product.category
                            )
                                ? 'Strain:'
                                : 'Size:'}
                        </label>
                        <select
                            id={`size-${product.name}`}
                            className="w-full rounded border border-gray-300 p-2 font-semibold dark:bg-gray-800 dark:text-white"
                            value={selectedSize}
                            onChange={(e) => setSelectedSize(e.target.value)}
                            aria-label={
                                ['Vapes & Carts', 'Other'].includes(
                                    product.category
                                )
                                    ? 'Select strain'
                                    : 'Select size'
                            }
                        >
                            {product.size_options.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            {/* Flavor dropdown (if no sizes) */}
            {!combinedOptions.length &&
                product.flavors &&
                product.flavors.length > 0 && (
                    <div className="mt-2">
                        <label
                            htmlFor={`flavor-${product.name}`}
                            className="mb-1 block text-xs text-gray-600 dark:text-white"
                        >
                            Flavor:
                        </label>
                        <select
                            id={`flavor-${product.name}`}
                            className="w-full rounded border border-gray-300 p-2 dark:bg-gray-800 dark:text-white"
                            value={selectedFlavor}
                            onChange={(e) => setSelectedFlavor(e.target.value)}
                            aria-label="Select flavor"
                        >
                            {product.flavors.map((flavor) => (
                                <option key={flavor} value={flavor}>
                                    {flavor}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            <p className="mt-2 font-medium text-gray-900 dark:text-white">
                {/* Dynamically calculate the price based on the selected flavor and size */}
                ${price ? price.toFixed(2) : 'N/A'}
            </p>
            <div className="mt-1 flex items-center">
                {/* Render the rating stars */}
                {[...Array(5)].map((_, i) => (
                    <FontAwesomeIcon
                        key={i}
                        icon={
                            i <
                                Math.floor(
                                    product.rating ||
                                    (product.ratings && product.ratings[0]) ||
                                    5
                                )
                                ? faStarSolid
                                : faStarRegular
                        }
                        className="text-xs text-yellow-600"
                        aria-hidden="true"
                    />
                ))}
                <span className="ml-1 text-xs text-gray-700 dark:text-white">
                    {/* Show the rating number */}(
                    {product.rating ||
                        (product.ratings && product.ratings[0]) ||
                        5}
                    )
                </span>
            </div>
        </div>
    )
})

ProductCard.displayName = 'ProductCard'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)
