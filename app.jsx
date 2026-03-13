import React from 'react'
import ReactDOM from 'react-dom/client'
import { businessInfo } from './src/utils/businessInfo.js'
import AgeGate from './src/components/AgeGate.jsx'
import ErrorBoundary from './src/components/ErrorBoundary.jsx'
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
    faChevronUp,
} from '@fortawesome/free-solid-svg-icons'
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
const ProductCatalogSection = React.lazy(() =>
    import('./src/components/ProductCatalogSection.jsx')
)

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


const SITE_URL = 'https://www.route66hemp.com'

const upsertMetaBy = (attribute, key, content) => {
    let meta = document.head.querySelector(`meta[${attribute}="${key}"]`)
    if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute(attribute, key)
        document.head.appendChild(meta)
    }
    meta.setAttribute('content', content)
}

const setMetaByName = (name, content) => {
    upsertMetaBy('name', name, content)
}

const setMetaByProperty = (property, content) => {
    upsertMetaBy('property', property, content)
}

const setCanonicalHref = (href) => {
    let canonicalLink = document.head.querySelector('link[rel="canonical"]')
    if (!canonicalLink) {
        canonicalLink = document.createElement('link')
        canonicalLink.setAttribute('rel', 'canonical')
        document.head.appendChild(canonicalLink)
    }
    canonicalLink.setAttribute('href', href)
}

const LOCAL_LANDING_PAGES = {
    '/dispensary-st-robert-mo': {
        slug: 'dispensary-st-robert-mo',
        title: 'THCa Dispensary in St Robert, MO | Route 66 Hemp',
        description:
            'Route 66 Hemp is a THCa and hemp dispensary in St Robert, MO near I-44 with lab-tested flower, edibles, concentrates, and vapes.',
        h1: 'THCa Dispensary in St Robert, MO',
        intent: 'dispensary in st robert mo',
        directions:
            'From I-44, take Exit 161 toward St Robert, then follow Missouri State Hwy Z to 14076 State Hwy Z for quick in-store shopping.',
        parking:
            'Storefront parking is directly in front of the entrance with easy in-and-out access for fast pickup stops.',
        neighborhoods:
            'We serve St Robert, Waynesville, Dixon, and nearby Pulaski County communities looking for reliable THCa and hemp products.',
    },
    '/dispensary-near-fort-leonard-wood': {
        slug: 'dispensary-near-fort-leonard-wood',
        title: 'Dispensary Near Fort Leonard Wood in St Robert, MO | Route 66 Hemp',
        description:
            'Looking for a dispensary near Fort Leonard Wood? Route 66 Hemp in St Robert offers fast access, clear product info, and lab-tested THCa options.',
        h1: 'Trusted Dispensary Near Fort Leonard Wood',
        intent: 'dispensary near fort leonard wood',
        directions:
            'From Fort Leonard Wood, head toward St Robert via Missouri Ave and Old Route 66, then continue to State Hwy Z for a short drive to our storefront.',
        parking:
            'Our lot includes accessible spaces and straightforward parking for service members, families, and local residents.',
        neighborhoods:
            'Customers visit us from Fort Leonard Wood housing areas, St Robert, Waynesville, and surrounding Pulaski County towns.',
    },
    '/route-66-dispensary-st-robert-mo': {
        slug: 'route-66-dispensary-st-robert-mo',
        title: 'Route 66 Hemp Dispensary in St Robert, MO | Near Fort Leonard Wood',
        description:
            'Route 66 Hemp is a Route 66 dispensary in St Robert, MO with lab-tested THCa flower, edibles, concentrates, and expert in-store guidance.',
        h1: 'Route 66 Hemp Dispensary in St Robert, Missouri',
        intent: 'route 66 dispensary st robert mo',
        directions:
            'Traveling historic Route 66? We are a short turn from the main corridor at 14076 State Hwy Z in St Robert, MO.',
        parking:
            'Dedicated storefront parking makes it easy to stop while commuting through St Robert or exploring Route 66 landmarks.',
        neighborhoods:
            'We serve Route 66 travelers and local shoppers from St Robert, Waynesville, and the greater Fort Leonard Wood area.',
    },
}

const LocalLandingPage = React.memo(function LocalLandingPage({ page }) {
    React.useEffect(() => {
        document.title = page.title

        const canonicalHref = `${SITE_URL}/${page.slug}/`
        setMetaByName('description', page.description)
        setMetaByProperty('og:title', page.title)
        setMetaByProperty('og:description', page.description)
        setMetaByProperty('og:url', canonicalHref)
        setMetaByProperty('og:type', 'website')
        setMetaByName('twitter:title', page.title)
        setMetaByName('twitter:description', page.description)
        setCanonicalHref(canonicalHref)
    }, [page])

    const localBusinessSchema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: businessInfo.name,
        url: `${SITE_URL}/${page.slug}/`,
        image: `${SITE_URL}/assets/images/route-66-hemp-storefront-st-robert-1280w.webp`,
        telephone: businessInfo.phone,
        priceRange: '$$',
        address: {
            '@type': 'PostalAddress',
            streetAddress: businessInfo.address.street,
            addressLocality: businessInfo.address.city,
            addressRegion: businessInfo.address.state,
            postalCode: businessInfo.address.zip,
            addressCountry: 'US',
        },
        openingHoursSpecification: Object.entries(businessInfo.hours).map(
            ([day, hours]) => ({
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: `https://schema.org/${day.charAt(0).toUpperCase()}${day.slice(1)}`,
                opens: hours.open,
                closes: hours.close,
            })
        ),
    }

    return (
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
            <AgeGate />
            <nav className="bg-white shadow-sm dark:bg-gray-900">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <a href="/" className="text-lg font-bold text-slate-900 dark:text-white">{businessInfo.name}</a>
                    <div className="flex gap-4 text-sm">
                        <a href="/" className="text-slate-600 hover:text-emerald-600 dark:text-slate-300">Home</a>
                        <a href="/dispensary-st-robert-mo/" className="text-slate-600 hover:text-emerald-600 dark:text-slate-300">St Robert</a>
                        <a href="/dispensary-near-fort-leonard-wood/" className="text-slate-600 hover:text-emerald-600 dark:text-slate-300">Fort Leonard Wood</a>
                    </div>
                </div>
            </nav>
            <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white">{page.h1}</h1>
                <p className="mt-4 text-lg text-slate-700 dark:text-slate-300">{page.description}</p>

                <section className="mt-8 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Directions, Parking, and Store Access</h2>
                    <p className="mt-3 text-slate-700 dark:text-slate-300">{page.directions}</p>
                    <p className="mt-3 text-slate-700 dark:text-slate-300">{page.parking}</p>
                </section>

                <section className="mt-6 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Areas We Serve in Pulaski County</h2>
                    <p className="mt-3 text-slate-700 dark:text-slate-300">{page.neighborhoods}</p>
                </section>

                <section className="mt-6 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-800">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Store Hours, Phone, and Address</h2>
                    <p className="mt-3 text-slate-700 dark:text-slate-300">Monday - Thursday: {businessInfo.hoursDisplay['Monday - Thursday']}; Friday - Saturday: {businessInfo.hoursDisplay['Friday - Saturday']}; Sunday: {businessInfo.hoursDisplay.Sunday}</p>
                    <p className="mt-2 text-slate-700 dark:text-slate-300">
                        Call <a className="text-emerald-700 hover:underline dark:text-emerald-300 dark:hover:text-emerald-200" href={businessInfo.phoneLink}>{businessInfo.phoneFormatted}</a> or visit us at {businessInfo.address.full}.
                    </p>
                    <a href="/#contact" className="mt-4 inline-block rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800">Call or Visit Route 66 Hemp</a>
                </section>

                <section className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/40">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">More Local Dispensary Pages</h2>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">
                        {Object.values(LOCAL_LANDING_PAGES).map((landingPage) => (
                            <li key={landingPage.slug}>
                                <a href={`/${landingPage.slug}/`} className="text-emerald-700 hover:underline dark:text-emerald-300">{landingPage.h1}</a>
                            </li>
                        ))}
                    </ul>
                </section>

                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
            </main>
        </div>
    )
})


export default function App() {
    const currentPath =
        typeof window !== 'undefined'
            ? window.location.pathname.replace(/\/$/, '') || '/'
            : '/'
    const localLandingPage = LOCAL_LANDING_PAGES[currentPath]

    const [appState, setAppState] = React.useState({
        isMobileMenuOpen: false,
        isProductCatalogRequested: false,
    })
    const requestProductCatalog = React.useCallback(() => {
        setAppState((prevState) =>
            prevState.isProductCatalogRequested
                ? prevState
                : { ...prevState, isProductCatalogRequested: true }
        )
    }, [])

    React.useEffect(() => {
        if (localLandingPage) {
            return
        }

        if (typeof window === 'undefined') {
            return
        }

        if (window.location.hash === '#products') {
            requestProductCatalog()
        }
    }, [localLandingPage, requestProductCatalog])

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

    if (localLandingPage) {
        return (
            <>
                <LocalLandingPage page={localLandingPage} />
            </>
        )
    }

    return (
        <div className="flex min-h-screen flex-col">
            <div id="home"></div>
            <React.Suspense fallback={null}>
                <StructuredData includeFaqSchema />
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
                            <a
                                href="/dispensary-st-robert-mo/"
                                className="px-3 py-2 text-sm font-medium text-gray-900 transition duration-150 hover:text-emerald-600 dark:text-white"
                            >
                                Local Dispensary Pages
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
                            <a
                                href="/dispensary-st-robert-mo/"
                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:text-emerald-600 dark:text-white"
                            >
                                Local Dispensary Pages
                            </a>
                        </div>
                    </div>
                )}
            </nav>
            <section>
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-[radial-gradient(120%_120%_at_0%_0%,#ECFDF5_0%,#F8FAFC_55%,#FFFFFF_100%)] dark:bg-[radial-gradient(120%_120%_at_0%_0%,#064E3B_0%,#0F172A_55%,#020617_100%)]">
                    <div className="mx-auto max-w-7xl">
                        <div className="relative z-10 bg-[radial-gradient(120%_120%_at_0%_0%,#ECFDF5_0%,#F8FAFC_55%,#FFFFFF_100%)] pb-8 sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32 dark:bg-[radial-gradient(120%_120%_at_0%_0%,#064E3B_0%,#0F172A_55%,#020617_100%)]">
                            <div className="pt-10 sm:pt-16 lg:overflow-hidden lg:pb-14 lg:pt-8">
                                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                    <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                                        <div className="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 sm:text-center lg:flex lg:items-center lg:px-0 lg:text-left">
                                            <div className="lg:py-24">
                                                <h1 className="mt-4 text-4xl font-bold leading-tight tracking-[-0.02em] text-slate-900 sm:mt-5 sm:text-6xl lg:mt-6 xl:text-7xl dark:text-white">
                                                    <span>
                                                        THCa & Hemp Dispensary
                                                    </span>
                                                    <span className="block text-emerald-700 dark:text-emerald-300">
                                                        In St Robert, MO Near Fort Leonard Wood
                                                    </span>
                                                </h1>
                                                <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:mt-6 sm:text-lg xl:text-xl dark:text-slate-300">
                                                    Shop lab-tested THCa flower,
                                                    edibles, concentrates, and
                                                    vapes with clear pricing,
                                                    straightforward guidance,
                                                    and fast in-store service.
                                                </p>
                                                <div className="mt-10 flex justify-center sm:mt-12 lg:justify-start">
                                                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                                                        <a href="#products" onClick={(e) => handleNavigation(e, 'products')} className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-8 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"> Shop THCa Products </a>
                                                        <a href="#about" onClick={(e) => handleNavigation(e, 'about')} className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white px-8 py-4 text-base font-semibold text-emerald-700 shadow-sm transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 dark:border-emerald-700 dark:bg-transparent dark:text-emerald-300 dark:hover:bg-emerald-900/30"> Why local shoppers choose us </a>
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
                                                    className="w-full overflow-hidden rounded-2xl border border-white/60 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)] dark:border-slate-700/50"
                                                    sizes="(max-width: 640px) min(28rem, calc(100vw - 2rem - 2px)), (max-width: 1024px) min(42rem, calc(100vw - 3rem)), min(39rem, calc(50vw - 3rem))"
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
                <section id="local-pages" className="bg-emerald-50/70 py-12 dark:bg-emerald-950/20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Choose a Local Dispensary Page</h2>
                        <p className="mt-3 max-w-3xl text-slate-700 dark:text-slate-300">
                            Compare directions, parking details, service areas, and contact info for St Robert and Fort Leonard Wood visitors.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-4">
                            <a href="/dispensary-st-robert-mo/" className="text-emerald-700 hover:underline dark:text-emerald-300">Dispensary in St Robert, MO</a>
                            <a href="/dispensary-near-fort-leonard-wood/" className="text-emerald-700 hover:underline dark:text-emerald-300">Dispensary Near Fort Leonard Wood</a>
                            <a href="/route-66-dispensary-st-robert-mo/" className="text-emerald-700 hover:underline dark:text-emerald-300">Route 66 Dispensary St Robert, MO</a>
                        </div>
                    </div>
                </section>
                {/* Products Section */}
                <div id="products" className="bg-slate-50 py-16 dark:bg-slate-900">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-8 lg:text-center">
                            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                                Products
                            </h2>
                            <p className="mt-3 text-3xl font-bold leading-snug tracking-[-0.01em] text-slate-900 sm:text-5xl dark:text-white">
                                Lab-Tested THCa and Hemp Product Menu
                            </p>
                            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600 lg:mx-auto dark:text-slate-300">
                                Browse flower, edibles, concentrates, vapes,
                                and more with clear categories, options, and
                                pricing.
                            </p>
                        </div>
                        {appState.isProductCatalogRequested ? (
                            <React.Suspense
                                fallback={renderSectionSkeleton('h-[32rem]')}
                            >
                                <ProductCatalogSection />
                            </React.Suspense>
                        ) : (
                            <div className="mx-auto max-w-2xl rounded-2xl bg-linear-to-r from-emerald-800 to-emerald-700 p-8 text-center shadow-lg dark:from-emerald-900 dark:to-emerald-800">
                                <p className="text-lg font-semibold text-white">
                                    Ready to browse today&apos;s in-store THCa and hemp menu?
                                </p>
                                <p className="mt-2 text-sm text-emerald-100">
                                    Tap below to load our latest product availability, category options, and pricing.
                                </p>
                                <button
                                    type="button"
                                    onClick={requestProductCatalog}
                                    className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-emerald-800 shadow hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-800 dark:text-emerald-800"
                                >
                                    Load Product Menu
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                {/* About Section */}
                <div id="about" className="bg-white py-12 dark:bg-gray-800">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-10 lg:text-center">
                            <h2 className="text-base font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
                                Why Route 66 Hemp
                            </h2>
                            <p className="mt-2 text-3xl font-extrabold leading-snug tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                                Local Team. Verified Quality.
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
                                                        Source-to-Shelf Standards
                                                    </h3>
                                                    <p className="text-lg">
                                                        We focus on consistent
                                                        quality, transparent
                                                        testing, and reliable
                                                        in-store guidance.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-10 lg:col-start-1 lg:row-start-1 lg:mt-0">
                                    <div className="mx-auto max-w-prose text-base lg:max-w-none">
                                        <p className="text-lg text-gray-700 dark:text-white">
                                            Route 66 Hemp was built to make
                                            hemp shopping easier for St Robert
                                            and Fort Leonard Wood communities.
                                            Our mission is simple: offer
                                            reliable products, clear info, and
                                            respectful service.
                                        </p>
                                        <div className="prose prose-indigo dark:prose-invert mt-5 text-gray-700 dark:text-white">
                                            <p>
                                                We curate products from trusted
                                                growers and manufacturers that
                                                follow strict standards for
                                                consistency, purity, and legal
                                                compliance.
                                            </p>
                                            <p>
                                                Every product is backed by
                                                third-party lab testing so you
                                                can review cannabinoid content,
                                                potency, and quality before you
                                                buy.
                                            </p>
                                            <p>
                                                Our staff helps new and
                                                returning shoppers compare
                                                formats, strengths, and product
                                                types to find the right fit.
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
                                                Third-Party Lab Verified
                                            </h3>
                                            <p className="mt-5 text-base text-gray-700 dark:text-white">
                                                We prioritize products with
                                                accessible lab results so you
                                                can verify cannabinoid content
                                                and quality.
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
                                                Carefully Sourced Hemp
                                            </h3>
                                            <p className="mt-5 text-base text-gray-700 dark:text-white">
                                                Our menu focuses on trusted
                                                suppliers known for dependable
                                                standards and consistent
                                                inventory quality.
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
                                                In-Store Product Guidance
                                            </h3>
                                            <p className="mt-5 text-base text-gray-700 dark:text-white">
                                                Our team can walk you through
                                                categories, strengths, and
                                                formats so you can shop with
                                                confidence.
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
                            <h2 className="text-base font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">
                                Contact Us
                            </h2>
                            <p className="mt-2 text-3xl font-extrabold leading-snug tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                                Visit Route 66 Hemp Today
                            </p>
                            <p className="mt-4 max-w-2xl text-xl text-gray-700 lg:mx-auto dark:text-white">
                                Questions about products, directions, or store hours? Call us or stop in.
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
                className="relative overflow-hidden bg-slate-950"
            >
                <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
                    <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                        <div className="space-y-8 xl:col-span-1">
                            <div className="flex items-center">
                                <div className="mr-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600">
                                    <FontAwesomeIcon
                                        icon={faCannabis}
                                        className="text-white"
                                        aria-hidden="true"
                                    />
                                </div>
                                <span className="text-xl font-bold text-white">
                                    {businessInfo.name}
                                </span>
                            </div>
                            <p className="text-sm text-slate-300">
                                Lab-tested THCa flower, edibles,
                                concentrates, and vapes in St Robert, MO.
                            </p>
                            <div className="flex space-x-6">
                                <a
                                    href="https://www.facebook.com/route66hemp/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-slate-300 transition-colors hover:text-emerald-300"
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
                                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                                    Products
                                </h3>
                                <ul className="mt-4 space-y-4">
                                    <li>
                                        <a
                                            href="#products"
                                            onClick={(e) => handleNavigation(e, 'products')}
                                            className="text-sm text-slate-300 transition-colors hover:text-emerald-300"
                                        >
                                            Edibles
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#products"
                                            onClick={(e) => handleNavigation(e, 'products')}
                                            className="text-sm text-slate-300 transition-colors hover:text-emerald-300"
                                        >
                                            Concentrates
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#products"
                                            onClick={(e) => handleNavigation(e, 'products')}
                                            className="text-sm text-slate-300 transition-colors hover:text-emerald-300"
                                        >
                                            Flower
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div className="mt-12 md:mt-0">
                                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                                    Company
                                </h3>
                                <ul className="mt-4 space-y-4">
                                    <li>
                                        <a
                                            href="#about"
                                            onClick={(e) => handleNavigation(e, 'about')}
                                            className="text-sm text-slate-300 transition-colors hover:text-emerald-300"
                                        >
                                            About Us
                                        </a>
                                    </li>
                                    <li>
                                        <a href="/dispensary-st-robert-mo/" className="text-sm text-slate-300 transition-colors hover:text-emerald-300">Dispensary in St Robert, MO</a>
                                    </li>
                                    <li>
                                        <a href="/dispensary-near-fort-leonard-wood/" className="text-sm text-slate-300 transition-colors hover:text-emerald-300">Dispensary Near Fort Leonard Wood</a>
                                    </li>
                                    <li>
                                        <a href="/route-66-dispensary-st-robert-mo/" className="text-sm text-slate-300 transition-colors hover:text-emerald-300">Route 66 Hemp Dispensary</a>
                                    </li>
                                </ul>
                            </div>
                            <div className="mt-12 md:mt-0">
                                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                                    Support
                                </h3>
                                <ul className="mt-4 space-y-4">
                                    <li>
                                        <a
                                            href="#contact"
                                            onClick={(e) => handleNavigation(e, 'contact')}
                                            className="text-sm text-slate-300 transition-colors hover:text-emerald-300"
                                        >
                                            Contact Us
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#faq"
                                            onClick={(e) => handleNavigation(e, 'faq')}
                                            className="text-sm text-slate-300 transition-colors hover:text-emerald-300"
                                        >
                                            FAQs
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div className="mt-12 md:mt-0">
                                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                                    Legal
                                </h3>
                                <ul className="mt-4 space-y-4">
                                    <li>
                                        <a
                                            href="/privacy-policy"
                                            className="text-sm text-slate-300 transition-colors hover:text-emerald-300"
                                            title="Privacy Policy"
                                        >
                                            Privacy Policy
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="/terms-of-service"
                                            className="text-sm text-slate-300 transition-colors hover:text-emerald-300"
                                        >
                                            Terms and Conditions
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="/cookie-policy"
                                            className="text-sm text-slate-300 transition-colors hover:text-emerald-300"
                                            title="Cookie Policy"
                                        >
                                            Cookie Policy
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 border-t border-slate-800 pt-8">
                        <p className="text-center text-sm text-slate-400">
                            &copy; 2025 {businessInfo.name}. All rights
                            reserved.
                        </p>
                        <p className="mt-2 text-center text-sm text-slate-400">
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
                                    className="text-sm text-slate-400"
                                />
                            </React.Suspense>
                        </div>
                    </div>
                </div>
            </footer>
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

const rootElement = document.getElementById('root')

if (rootElement) {
    const root = ReactDOM.createRoot(rootElement)
    root.render(
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    )
}
