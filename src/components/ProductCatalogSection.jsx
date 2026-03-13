import React from 'react'
import ResponsiveImage from './ResponsiveImage.jsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faCannabis,
    faStar as faStarSolid,
} from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons'

const DANGEROUS = new Set(['__proto__', 'prototype', 'constructor'])
const DESKTOP_PAGE_SIZE = 8
const MOBILE_PAGE_SIZE = 4
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

const clean = (key) => (DANGEROUS.has(key) ? undefined : key)

function slugify(str = '') {
    return String(str)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

const toArray = (value) => {
    if (Array.isArray(value)) {
        return value.filter((entry) => entry != null)
    }
    return value != null ? [value] : []
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
        if (
            Number.isFinite(numerator) &&
            Number.isFinite(denominator) &&
            denominator !== 0
        ) {
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
        return {
            group: 'mass',
            normalized: numeric * SIZE_UNIT_FACTORS.oz.factor,
        }
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
            const groupA =
                SIZE_GROUP_ORDER[a.group] ?? SIZE_GROUP_ORDER.unknown
            const groupB =
                SIZE_GROUP_ORDER[b.group] ?? SIZE_GROUP_ORDER.unknown
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
        return 'Lab-tested hemp product available at Route 66 Hemp in St Robert, Missouri'
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

    segments.push('Lab-Tested Hemp Product at Route 66 Hemp, St Robert, Missouri')

    return segments.join(' - ')
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

const getPageSize = () => {
    if (
        typeof window === 'undefined' ||
        typeof window.matchMedia !== 'function'
    ) {
        return DESKTOP_PAGE_SIZE
    }

    return window.matchMedia('(max-width: 640px)').matches
        ? MOBILE_PAGE_SIZE
        : DESKTOP_PAGE_SIZE
}

async function loadProductCatalog() {
    const response = await fetch('/products/products.json')
    if (!response.ok) {
        throw new Error('Failed to fetch products')
    }

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) {
        const bodyPreview = (await response.text()).slice(0, 120)
        throw new Error(
            `Expected JSON product catalog but received "${contentType || 'unknown'}": ${bodyPreview}`
        )
    }

    const productsData = await response.json()
    const normalizedProducts = normalizeProducts(productsData)

    return {
        products: normalizedProducts,
        categories: buildCategories(normalizedProducts),
    }
}

const ProductCard = React.memo(function ProductCard({ product }) {
    const combinedOptions = React.useMemo(() => {
        if (
            product.flavors &&
            product.flavors.length > 0 &&
            product.size_options &&
            product.size_options.length > 0
        ) {
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

    const [selectedCombo, setSelectedCombo] = React.useState(
        combinedOptions.length > 0 ? combinedOptions[0] : null
    )
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

    let price = product.price
    if (combinedOptions.length > 0 && selectedCombo) {
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
        price = product.prices[selectedSize]
    } else if (!selectedSize && selectedFlavor && product.price) {
        price = product.price
    }

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

    return (
        <div
            id={`product-${slugify(product.category)}-${slugify(product.name)}`}
            className="product-card group relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
        >
            {banner ? (
                <div className="product-banner" aria-label={banner}>
                    {banner}
                </div>
            ) : null}
            <ResponsiveImage
                src={
                    product.image ||
                    (Array.isArray(product.images) && product.images[0]) ||
                    getPlaceholderForCategory(product.category)
                }
                alt={generateProductAlt(product)}
                width={400}
                height={400}
                className="mb-5 h-52 w-full rounded-xl object-cover"
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
            {combinedOptions.length > 0 ? (
                <div className="mt-2">
                    <label
                        htmlFor={`combo-${product.name}`}
                        className="mb-1 block text-xs font-semibold text-black dark:text-white"
                    >
                        Flavor & Size:
                    </label>
                    <select
                        id={`combo-${product.name}`}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                        value={selectedCombo ? selectedCombo.label : ''}
                        onChange={(event) => {
                            const combo = combinedOptions.find(
                                (option) => option.label === event.target.value
                            )
                            setSelectedCombo(combo ?? null)
                        }}
                        aria-label="Select flavor and size"
                    >
                        {combinedOptions.map((option) => (
                            <option key={option.label} value={option.label}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            ) : null}
            {!combinedOptions.length &&
            product.size_options &&
            product.size_options.length > 0 ? (
                <div className="mt-2">
                    <label
                        htmlFor={`size-${product.name}`}
                        className="mb-1 block text-xs font-semibold text-black dark:text-white"
                    >
                        {['Vapes & Carts', 'Other'].includes(product.category)
                            ? 'Strain:'
                            : 'Size:'}
                    </label>
                    <select
                        id={`size-${product.name}`}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                        value={selectedSize ?? ''}
                        onChange={(event) => setSelectedSize(event.target.value)}
                        aria-label={
                            ['Vapes & Carts', 'Other'].includes(product.category)
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
            ) : null}
            {!combinedOptions.length &&
            product.flavors &&
            product.flavors.length > 0 ? (
                <div className="mt-2">
                    <label
                        htmlFor={`flavor-${product.name}`}
                        className="mb-1 block text-xs text-gray-600 dark:text-white"
                    >
                        Flavor:
                    </label>
                    <select
                        id={`flavor-${product.name}`}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                        value={selectedFlavor ?? ''}
                        onChange={(event) =>
                            setSelectedFlavor(event.target.value)
                        }
                        aria-label="Select flavor"
                    >
                        {product.flavors.map((flavor) => (
                            <option key={flavor} value={flavor}>
                                {flavor}
                            </option>
                        ))}
                    </select>
                </div>
            ) : null}
            <p className="mt-2 font-medium text-gray-900 dark:text-white">
                ${price ? price.toFixed(2) : 'N/A'}
            </p>
            <div className="mt-1 flex items-center">
                {[...Array(5)].map((_, index) => (
                    <FontAwesomeIcon
                        key={index}
                        icon={
                            index <
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
                    (
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

export default function ProductCatalogSection() {
    const [catalogState, setCatalogState] = React.useState({
        selectedCategory: 'all',
        products: [],
        categories: [],
        loading: true,
        loadError: null,
    })
    const [requestVersion, setRequestVersion] = React.useState(0)
    const [isFiltering, startFiltering] = React.useTransition()
    const [pageSize, setPageSize] = React.useState(getPageSize)
    const [visibleCount, setVisibleCount] = React.useState(() =>
        Math.max(getPageSize(), 1)
    )

    React.useEffect(() => {
        let isCancelled = false

        setCatalogState((prevState) => ({
            ...prevState,
            loading: true,
            loadError: null,
        }))

        const load = async () => {
            try {
                const { products, categories } = await loadProductCatalog()

                if (isCancelled) return

                setCatalogState((prevState) => ({
                    ...prevState,
                    categories,
                    products,
                    loading: false,
                    loadError: null,
                }))
            } catch (error) {
                if (isCancelled) return

                console.error('Error loading products:', error)
                setCatalogState((prevState) => ({
                    ...prevState,
                    loading: false,
                    loadError:
                        'Unable to load the product catalog. Please try again.',
                }))
            }
        }

        load()

        return () => {
            isCancelled = true
        }
    }, [requestVersion])

    React.useEffect(() => {
        if (
            typeof window === 'undefined' ||
            typeof window.matchMedia !== 'function'
        ) {
            return undefined
        }

        const mediaQuery = window.matchMedia('(max-width: 640px)')
        const handleChange = () => {
            setPageSize(getPageSize())
        }

        handleChange()
        if (typeof mediaQuery.addEventListener === 'function') {
            mediaQuery.addEventListener('change', handleChange)
            return () => mediaQuery.removeEventListener('change', handleChange)
        }

        mediaQuery.addListener(handleChange)
        return () => mediaQuery.removeListener(handleChange)
    }, [])

    const filteredProducts = React.useMemo(() => {
        if (catalogState.selectedCategory === 'all') {
            return catalogState.products
        }

        return catalogState.products.filter(
            (product) =>
                slugify(product.category) === catalogState.selectedCategory
        )
    }, [catalogState.products, catalogState.selectedCategory])

    const deferredProducts = React.useDeferredValue(filteredProducts)
    const visibleProducts = React.useMemo(
        () => deferredProducts.slice(0, visibleCount),
        [deferredProducts, visibleCount]
    )

    React.useEffect(() => {
        setVisibleCount(pageSize)
    }, [catalogState.selectedCategory, deferredProducts.length, pageSize])

    const handleCategorySelect = React.useCallback(
        (categoryId) => {
            startFiltering(() => {
                setCatalogState((prevState) =>
                    prevState.selectedCategory === categoryId
                        ? prevState
                        : { ...prevState, selectedCategory: categoryId }
                )
            })
        },
        [startFiltering]
    )

    return (
        <>
            <div
                className="mb-10 flex flex-wrap justify-center gap-3"
                role="group"
                aria-label="Filter products by category"
            >
                <button
                    type="button"
                    onClick={() => handleCategorySelect('all')}
                    aria-pressed={catalogState.selectedCategory === 'all'}
                    aria-label="Show all products"
                    className={`rounded-full border px-5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${
                        catalogState.selectedCategory === 'all'
                            ? 'border-emerald-700 bg-emerald-600 text-white shadow-sm dark:border-emerald-500 dark:bg-emerald-500 dark:text-slate-950'
                            : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'
                    }`}
                >
                    All Products
                </button>
                {catalogState.categories.map((category) => (
                    <button
                        key={category.id}
                        type="button"
                        onClick={() => handleCategorySelect(category.id)}
                        aria-pressed={catalogState.selectedCategory === category.id}
                        aria-label={`Filter by ${category.name}`}
                        className={`rounded-full border px-5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${
                            catalogState.selectedCategory === category.id
                                ? 'border-emerald-700 bg-emerald-600 text-white shadow-sm dark:border-emerald-500 dark:bg-emerald-500 dark:text-slate-950'
                                : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'
                        }`}
                    >
                        {category.name}
                    </button>
                ))}
            </div>
            {catalogState.loading ? (
                <div className="col-span-full flex items-center justify-center py-12">
                    <div className="leaf-loader">
                        <FontAwesomeIcon
                            icon={faCannabis}
                            className="text-5xl text-emerald-600 dark:text-emerald-500"
                            aria-hidden="true"
                        />
                    </div>
                    <span className="sr-only">Loading products...</span>
                </div>
            ) : catalogState.loadError ? (
                <div
                    role="alert"
                    aria-live="assertive"
                    className="col-span-full mx-auto max-w-xl rounded-2xl border border-emerald-100 bg-emerald-50 p-8 text-center text-emerald-900 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-900/30 dark:text-emerald-100"
                >
                    <h3 className="text-lg font-semibold">
                        We couldn&apos;t load today&apos;s product menu
                    </h3>
                    <p className="mt-3 text-sm">{catalogState.loadError}</p>
                    <button
                        type="button"
                        onClick={() =>
                            setRequestVersion((currentVersion) => currentVersion + 1)
                        }
                        className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-50 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:focus-visible:ring-offset-transparent"
                    >
                        Try again
                    </button>
                </div>
            ) : deferredProducts.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                        {visibleProducts.map((product) => (
                            <ProductCard
                                key={product.name + product.category}
                                product={product}
                            />
                        ))}
                    </div>
                    {deferredProducts.length > visibleProducts.length ? (
                        <div className="mt-10 text-center">
                            <button
                                type="button"
                                onClick={() =>
                                    startFiltering(() =>
                                        setVisibleCount(
                                            (count) => count + pageSize
                                        )
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
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
                        No products match this filter right now.
                    </p>
                </div>
            )}
            {isFiltering ? (
                <div
                    className="mt-6 text-center text-sm text-gray-500 dark:text-gray-300"
                    aria-live="polite"
                >
                    Refreshing product list...
                </div>
            ) : null}
        </>
    )
}
