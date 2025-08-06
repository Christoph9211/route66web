import React from 'react'
import ReactDOM from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import StructuredData from './src/components/StructuredData.jsx'
import LocalBusinessInfo from './src/components/LocalBusinessInfo.jsx'
import LocationContent from './src/components/LocationContent.jsx'
import GoogleBusinessIntegration from './src/components/GoogleBusinessIntegration.jsx'
import LocalSEOFAQ from './src/components/LocalSEOFAQ.jsx'
import { businessInfo } from './src/utils/seoHelpers.js'

const DANGEROUS = new Set(['__proto__', 'prototype', 'constructor'])
const clean = (k) => (DANGEROUS.has(k) ? undefined : k)

export default function App() {
    const [appState, setAppState] = React.useState({
        isMobileMenuOpen: false,
        selectedCategory: 'all',
        age: null,
        products: [],
        categories: [],
        loading: true,
    })

    React.useEffect(() => {
        const verifiedAge = localStorage.getItem('ageVerified')
        if (verifiedAge) {
            setAppState((prevState) => ({
                ...prevState,
                age: parseInt(verifiedAge),
            }))
        }

        // Fetch products from the JSON file
        fetch('products/products.json')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch products')
                }
                return response.json()
            })
            .then((productsData) => {
                // Group products by name and category, combining size options and prices
                const grouped = Object.create(null) // no prototype to pollute
                productsData.forEach((prod) => {
                    // Use name+category as key
                    const key =
                        (prod.name || prod['name']) +
                        '|' +
                        (prod.category || prod['category'])
                    if (!grouped[key]) {
                        grouped[key] = {
                            ...prod,
                            size_options: prod.size_options
                                ? [...prod.size_options]
                                : prod.size_options || [],
                            prices: prod.prices
                                ? { ...prod.prices }
                                : prod.prices || {},
                            variants: [],
                            ids: [prod.id],
                            images: [prod.image],
                            descriptions: [prod.description],
                            ratings: [prod.rating],
                            urls: [prod.url],
                        }
                        if (prod.size_options && prod.prices) {
                            // Already in new format
                        } else if (prod.name && prod.name.match(/ - (.+)/)) {
                            // Try to extract size from name
                            const size = prod.name.match(/ - (.+)/)[1]
                            grouped[key].size_options = [size]
                            const safeSize = clean(size) // drop dangerous names
                            if (safeSize) {
                                grouped[key].prices = { [safeSize]: prod.price }
                            }
                        } else {
                            grouped[key].size_options = []
                            grouped[key].prices = {}
                        }
                    } else {
                        // Add size/price if not present
                        if (prod.name && prod.name.match(/ - (.+)/)) {
                            const size = prod.name.match(/ - (.+)/)[1]
                            const safe = clean(size) // rename to avoid shadowing
                            if (!grouped[key].size_options.includes(size)) {
                                grouped[key].size_options.push(size)
                                if (safe) grouped[key].prices[safe] = prod.price
                            }
                        }
                        grouped[key].ids.push(prod.id)
                        grouped[key].images.push(prod.image)
                        grouped[key].descriptions.push(prod.description)
                        grouped[key].ratings.push(prod.rating)
                        grouped[key].urls.push(prod.url)
                    }
                })
                const groupedProducts = Object.values(grouped)
                // Extract unique categories from products
                const uniqueCategories = [
                    ...new Set(
                        groupedProducts.map((product) => product.category)
                    ),
                ]
                // Format categories for your UI
                const formattedCategories = uniqueCategories.map(
                    (categoryId) => {
                        const name = categoryId
                            .split('-')
                            .map(
                                (word) =>
                                    word.charAt(0).toUpperCase() + word.slice(1)
                            )
                            .join(' ')
                        return { id: categoryId, name }
                    }
                )
                setAppState((prevState) => ({
                    ...prevState,
                    categories: formattedCategories,
                    products: groupedProducts,
                    loading: false,
                }))
            })
            .catch((error) => {
                console.error('Error loading products:', error)
                setAppState((prevState) => ({
                    ...prevState,
                    loading: false,
                }))
            })
    }, [])

    const handleAgeVerification = (isOver21) => {
        if (isOver21) {
            setAppState((prevState) => ({ ...prevState, age: 21 }))
            localStorage.setItem('ageVerified', '21')
        } else {
            setAppState((prevState) => ({ ...prevState, age: 0 }))
        }
    }

    const filteredProducts =
        appState.selectedCategory === 'all'
            ? appState.products
            : appState.products.filter(
                  (product) => product.category === appState.selectedCategory
              )

    if (appState.age === null) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
                <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-lg dark:bg-gray-800">
                    <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                        Age Verification
                    </h2>
                    <div className="mb-8">
                        <i
                            className="fas fa-cannabis mb-4 text-5xl text-green-500"
                            aria-hidden="true"
                            tabIndex="-1"
                        ></i>
                        <p className="text-gray-900 dark:text-white">
                            You must be 21 years or older to enter this website.
                        </p>
                    </div>
                    <div className="flex flex-col space-y-4">
                        <button
                            onClick={() => handleAgeVerification(true)}
                            className="w-full rounded-lg bg-blue-600 py-3 text-xl font-semibold text-white transition duration-200 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
                        >
                            I am 21 or older
                        </button>
                        <button
                            onClick={() => handleAgeVerification(false)}
                            className="w-full rounded-lg bg-gray-600 py-3 text-xl font-semibold text-white transition duration-200 hover:bg-blue-700 dark:bg-gray-700 dark:hover:bg-gray-600"
                        >
                            I am under 21
                        </button>
                    </div>
                    <p className="mt-6 text-sm text-gray-700 dark:text-white">
                        By entering, you acknowledge and agree to our{' '}
                        <a
                            href="src/terms-of-service.html"
                            className="hover:text-blue-700 dark:hover:text-blue-600"
                        >
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a
                            href="src/privacy-policy.html"
                            className="hover:text-blue-700 dark:hover:text-blue-600"
                        >
                            Privacy Policy
                        </a>
                        .
                    </p>
                </div>
            </div>
        )
    }

    if (appState.age < 21) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
                <div className="w-full max-w-md rounded-lg bg-white p-6 text-center shadow-lg dark:bg-gray-800">
                    <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                        Access Denied
                    </h2>
                    <p className="mb-6 text-gray-900 dark:text-white">
                        You must be 21 or older to access this website.
                    </p>
                    <button
                        onClick={() =>
                            setAppState((prevState) => ({
                                ...prevState,
                                age: null,
                            }))
                        }
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white transition duration-200 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col">
            <StructuredData />
            {/* Navigation */}
            <nav
                role="navigation"
                className="sticky top-0 z-50 bg-white/90 shadow-md backdrop-blur dark:bg-gray-900/90"
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex items-center">
                            <div className="flex flex-shrink-0 items-center">
                                {/* Logo */}
                                <div className="mr-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                                    <i
                                        className="fas fa-cannabis text-white"
                                        aria-hidden="true"
                                        tabIndex="-1"
                                    ></i>
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
                                href="#"
                                className="px-3 py-2 text-sm font-medium text-gray-900 transition duration-150 hover:text-blue-600 dark:text-white"
                            >
                                Home
                            </a>
                            <a
                                href="#products"
                                className="px-3 py-2 text-sm font-medium text-gray-900 transition duration-150 hover:text-blue-600 dark:text-white"
                            >
                                Products
                            </a>
                            <a
                                href="#about"
                                className="px-3 py-2 text-sm font-medium text-gray-900 transition duration-150 hover:text-blue-600 dark:text-white"
                            >
                                About
                            </a>
                            <a
                                href="#contact"
                                className="px-3 py-2 text-sm font-medium text-gray-900 transition duration-150 hover:text-blue-600 dark:text-white"
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
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-900 hover:text-blue-600 focus:outline-none dark:text-blue-500"
                                aria-label={
                                    appState.isMobileMenuOpen
                                        ? 'Close main menu'
                                        : 'Open main menu'
                                }
                                aria-expanded={
                                    appState.isMobileMenuOpen ? 'true' : 'false'
                                }
                            >
                                <i
                                    className={`fas ${
                                        appState.isMobileMenuOpen
                                            ? 'fa-times'
                                            : 'fa-bars'
                                    } text-xl`}
                                    aria-hidden="true"
                                    tabIndex="-1"
                                ></i>
                            </button>
                        </div>
                    </div>
                </div>
                {appState.isMobileMenuOpen && (
                    <div className="md:hidden">
                        <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                            <a
                                href="#"
                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600 dark:text-white"
                            >
                                Home
                            </a>
                            <a
                                href="#products"
                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600 dark:text-white"
                            >
                                Products
                            </a>
                            <a
                                href="#about"
                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600 dark:text-white"
                            >
                                About
                            </a>
                            <a
                                href="#contact"
                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:text-blue-600 dark:text-white"
                            >
                                Contact
                            </a>
                        </div>
                    </div>
                )}
            </nav>
            <section>
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-gradient-to-r from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                    <div className="mx-auto max-w-7xl">
                        <div className="relative z-10 bg-gradient-to-r from-white via-gray-50 to-gray-100 pb-8 sm:pb-16 md:pb-20 lg:w-full lg:pb-28 xl:pb-32 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                            <div className="pt-10 sm:pt-16 lg:overflow-hidden lg:pb-14 lg:pt-8">
                                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                    <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                                        <div className="mx-auto max-w-md px-4 sm:max-w-2xl sm:px-6 sm:text-center lg:flex lg:items-center lg:px-0 lg:text-left">
                                            <div className="lg:py-24">
                                                <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:mt-5 sm:text-6xl lg:mt-6 xl:text-6xl dark:text-white">
                                                    <span>
                                                        Premium Hemp Products
                                                    </span>
                                                    <span className="block text-blue-600 dark:text-green-500">
                                                        For Your Wellness
                                                    </span>
                                                </h1>
                                                <p className="mt-3 text-base text-gray-700 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl dark:text-white">
                                                    Discover our range of
                                                    high-quality, lab-tested
                                                    hemp products. From CBD oils
                                                    to edibles, we have
                                                    everything you need for a
                                                    balanced lifestyle.
                                                </p>
                                                <div className="mt-10 flex justify-center space-x-4 sm:mt-12 lg:justify-start">
                                                    <div className="rounded-md shadow">
                                                        <a
                                                            href="#products"
                                                            className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-500 px-8 py-4 text-xl font-bold text-white hover:bg-blue-800 md:px-10 md:py-4 md:text-lg dark:bg-blue-800 dark:text-white dark:hover:bg-blue-800"
                                                        >
                                                            Explore Products
                                                        </a>
                                                    </div>
                                                    <div className="rounded-md shadow">
                                                        <a
                                                            href="#about"
                                                            className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-500 px-8 py-4 text-xl font-bold text-white hover:bg-blue-800 md:px-10 md:py-4 md:text-lg dark:bg-blue-800 dark:text-white dark:hover:bg-blue-800"
                                                        >
                                                            Learn More
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-12 lg:relative lg:m-0">
                                            <div className="mx-auto mt-12 max-w-md sm:max-w-2xl lg:mt-0">
                                                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 to-green-600 text-white shadow-xl">
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <i
                                                            className="fa-solid fa-cannabis text-9xl text-white opacity-50"
                                                            aria-hidden="true"
                                                            tabIndex="-1"
                                                        ></i>
                                                    </div>
                                                    <div className="absolute inset-0 flex items-center justify-center bg-opacity-20">
                                                        <div className="px-4 text-center text-white">
                                                            <div className="mb-2 text-2xl font-bold sm:text-3xl">
                                                                Premium Hemp
                                                            </div>
                                                            <div className="text-lg sm:text-xl">
                                                                Locally Grown,
                                                                Organically
                                                                Harvested
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
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
                            <h2 className="text-base font-semibold uppercase tracking-wide text-black dark:text-green-300">
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
                        <div className="mb-8 flex flex-wrap justify-center gap-2">
                            <button
                                onClick={() =>
                                    setAppState((prevState) => ({
                                        ...prevState,
                                        selectedCategory: 'all',
                                    }))
                                }
                                className={`rounded-full px-4 py-2 text-sm font-medium ${
                                    appState.selectedCategory === 'all'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-600'
                                }`}
                            >
                                All Products
                            </button>
                            {appState.categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() =>
                                        setAppState((prevState) => ({
                                            ...prevState,
                                            selectedCategory: category.id,
                                        }))
                                    }
                                    className={`rounded-full px-4 py-2 text-sm font-medium ${
                                        appState.selectedCategory ===
                                        category.id
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                        {appState.loading ? (
                            <div className="col-span-full flex items-center justify-center py-12">
                                <div className="leaf-loader">
                                    <i
                                        className="fas fa-cannabis text-5xl text-blue-600 dark:text-blue-500"
                                        aria-hidden="true"
                                        tabIndex="-1"
                                    ></i>
                                </div>
                                <span className="sr-only">
                                    Loading products...
                                </span>
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                                {filteredProducts.map((product) => (
                                    <ProductCard
                                        key={product.name + product.category}
                                        product={product}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="col-span-full py-12 text-center">
                                <p className="text-gray-700 dark:text-white">
                                    Products Coming Soon
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                {/* About Section */}
                <div id="about" className="bg-white py-12 dark:bg-gray-800">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-10 lg:text-center">
                            <h2 className="text-base font-semibold uppercase tracking-wide text-black dark:text-green-300">
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
                                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-green-800 to-green-600 p-6">
                                                <div className="text-center text-white">
                                                    <i
                                                        className="fas fa-leaf mb-4 text-6xl"
                                                        aria-hidden="true"
                                                        tabIndex="-1"
                                                    ></i>
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
                                            that enhance people's well-being
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
                                                At Route 66 Hemp, we're a
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
                                                    <i
                                                        className="fas fa-flask text-xl text-white"
                                                        aria-hidden="true"
                                                        tabIndex="-1"
                                                    ></i>
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
                                                    <i
                                                        className="fas fa-leaf text-xl text-white"
                                                        aria-hidden="true"
                                                        tabIndex="-1"
                                                    ></i>
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
                                                    <i
                                                        className="fas fa-users text-xl text-white"
                                                        aria-hidden="true"
                                                        tabIndex="-1"
                                                    ></i>
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
                <LocationContent />
                {/* Google Business Integration */}
                <GoogleBusinessIntegration />
                {/* Local SEO FAQ */}
                <LocalSEOFAQ />
                {/* Contact Section */}
                <div id="contact" className="bg-white py-12 dark:bg-gray-800">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-10 lg:text-center">
                            <h2 className="text-base font-semibold uppercase tracking-wide text-black dark:text-green-300">
                                Contact Us
                            </h2>
                            <p className="mt-2 text-3xl font-extrabold leading-8 tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                                Get In Touch
                            </p>
                            <p className="mt-4 max-w-2xl text-xl text-gray-700 lg:mx-auto dark:text-white">
                                Have questions? We're here to help!
                            </p>
                        </div>
                        <div
                            id="store-info"
                            className="mt-10 flex justify-center"
                        >
                            <div className="lg:w-1/2">
                                <LocalBusinessInfo />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Footer */}
            <footer
                role="contentinfo"
                className="relative overflow-hidden bg-gradient-to-r from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
            >
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                    <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                        <div className="space-y-8 xl:col-span-1">
                            <div className="flex items-center">
                                <div className="mr-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                                    <i
                                        className="fas fa-cannabis text-white"
                                        aria-hidden="true"
                                        tabIndex="-1"
                                    ></i>
                                </div>
                                <span className="text-xl font-bold text-white">
                                    {businessInfo.name}
                                </span>
                            </div>
                            <p className="text-base text-black dark:text-white">
                                Premium hemp products for your wellness journey.
                                Quality you can trust.
                            </p>
                            <div className="flex space-x-6">
                                <a
                                    href="#"
                                    className="text-black hover:text-gray-600 dark:text-white dark:hover:text-gray-300"
                                    aria-label="Facebook"
                                >
                                    <i
                                        className="fab fa-facebook text-xl"
                                        aria-hidden="true"
                                        tabIndex="-1"
                                    ></i>
                                    <span className="sr-only">Facebook</span>
                                </a>
                                <a
                                    href="#"
                                    className="text-black hover:text-gray-600 dark:text-white dark:hover:text-gray-300"
                                    aria-label="Instagram"
                                >
                                    <i
                                        className="fab fa-instagram text-xl"
                                        aria-hidden="true"
                                        tabIndex="-1"
                                    ></i>
                                    <span className="sr-only">Instagram</span>
                                </a>
                                <a
                                    href="#"
                                    className="text-black hover:text-gray-600 dark:text-white dark:hover:text-gray-300"
                                    aria-label="Twitter"
                                >
                                    <i
                                        className="fab fa-twitter text-xl"
                                        aria-hidden="true"
                                        tabIndex="-1"
                                    ></i>
                                    <span className="sr-only">Twitter</span>
                                </a>
                                <a
                                    href="#"
                                    className="text-black hover:text-gray-600 dark:text-white dark:hover:text-gray-300"
                                    aria-label="YouTube"
                                >
                                    <i
                                        className="fab fa-youtube text-xl"
                                        aria-hidden="true"
                                        tabIndex="-1"
                                    ></i>
                                    <span className="sr-only">YouTube</span>
                                </a>
                            </div>
                        </div>
                        <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                            <div className="md:grid md:grid-cols-2 md:gap-8">
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white">
                                        Products
                                    </h3>
                                    <ul className="mt-4 space-y-4">
                                        <li>
                                            <a
                                                href="#"
                                                className="text-base text-black hover:text-gray-600 dark:text-white dark:hover:text-gray-300"
                                            >
                                                Edibles
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#"
                                                className="ttext-black text-base hover:text-gray-600 dark:text-white dark:hover:text-gray-300"
                                            >
                                                Topicals
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#"
                                                className="text-base text-black hover:text-gray-600 dark:text-white dark:hover:text-gray-300"
                                            >
                                                Flower
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#"
                                                className="text-base text-black hover:text-gray-600 dark:text-white dark:hover:text-gray-300"
                                            >
                                                Accessories
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
                                                href="#"
                                                className="text-base text-black hover:text-gray-600 dark:text-white dark:hover:text-gray-300"
                                            >
                                                About Us
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#"
                                                className="text-base text-black hover:text-gray-600 dark:text-white dark:hover:text-gray-300"
                                            >
                                                Careers
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#"
                                                className="text-base text-black hover:text-gray-600 dark:text-white dark:hover:text-gray-300"
                                            >
                                                Partners
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div className="md:grid md:grid-cols-2 md:gap-8">
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white">
                                        Support
                                    </h3>
                                    <ul className="mt-4 space-y-4">
                                        <li>
                                            <a
                                                href="#"
                                                className="text-base text-black hover:text-gray-600 dark:text-white dark:hover:text-gray-300"
                                            >
                                                Contact Us
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#"
                                                className="text-base text-black hover:text-gray-600 dark:text-white dark:hover:text-gray-300"
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
                                                href="src/privacy-policy.html"
                                                className="text-base text-black hover:text-gray-600 dark:text-white dark:hover:text-gray-300"
                                            >
                                                Privacy Policy
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="src/terms-of-service.html"
                                                className="text-base text-black hover:text-gray-600 dark:text-white dark:hover:text-gray-300"
                                            >
                                                Terms of Service
                                            </a>
                                        </li>
                                        <li>
                                            <a
                                                href="#"
                                                className="text-base text-black hover:text-gray-600 dark:text-white dark:hover:text-gray-300"
                                            >
                                                Compliance
                                            </a>
                                        </li>
                                    </ul>
                                </div>
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
                            <LocalBusinessInfo
                                variant="inline"
                                className="text-sm text-black dark:text-white"
                            />
                        </div>
                    </div>
                </div>
            </footer>
            {/* ... */}
            <Analytics />
            {/* ... */}
            <SpeedInsights />
        </div>
    )
}

// ProductCard component for displaying product with size dropdown and dynamic price
function ProductCard({ product }) {
    // Generate combined options if both flavors and size_options exist
    let combinedOptions = []
    if (
        // Do we have flavors?
        product.flavors &&
        // Are there any flavors?
        product.flavors.length > 0 &&
        // Do we have size options?
        product.size_options &&
        // Are there any size options?
        product.size_options.length > 0
    ) {
        // Combine each flavor with each size option
        combinedOptions = product.flavors.flatMap((flavor) =>
            product.size_options.map((size) => ({
                // Create a label that's the combination of flavor and size
                label: `${flavor} - ${size}`,
                // Store the flavor and size for later use
                flavor,
                size,
            }))
        )
    }

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
            className="product-card group relative rounded-lg bg-white p-4 shadow dark:bg-gray-700"
            // This class is for the card shadow effect
        >
            {banner && (
                <div className="product-banner" aria-label={banner}>
                    {banner}
                </div>
            )}
            <img
                src={
                    // If the product has an image, use it
                    product.image ||
                    // If the product has an array of images, use the first one
                    (product.images && product.images[0]) ||
                    // If the product has no images, use a placeholder image
                    '/assets/images/placeholder.webp'
                }
                alt={product.name}
                className="h-50 mb-4 w-full rounded-md object-cover"
                // This class is for the image height and object-fit
                onError={(e) => {
                    // If the image fails to load, use a placeholder image
                    e.target.onerror = null
                    e.target.src = '/assets/images/placeholder.webp'
                }}
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
                    <i
                        key={i}
                        className={`text-xs ${
                            i <
                            Math.floor(
                                product.rating ||
                                    (product.ratings && product.ratings[0]) ||
                                    5
                            )
                                ? 'fas fa-star text-yellow-600'
                                : 'far fa-star text-yellow-600'
                        }`}
                        aria-hidden="true"
                        tabIndex={'-1'}
                    ></i>
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
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)
