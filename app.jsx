import React, { useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

// Import components
import Navigation from './src/components/Navigation'
import BreadcrumbNavigation from './src/components/BreadcrumbNavigation'
import FooterNavigation from './src/components/FooterNavigation'
import QuickNavigation from './src/components/QuickNavigation'
import LocalSEOFAQ from './src/components/LocalSEOFAQ'
import LocationContent from './src/components/LocationContent'
import GoogleBusinessIntegration from './src/components/GoogleBusinessIntegration'
import LocalBusinessInfo from './src/components/LocalBusinessInfo'
import StructuredData from './src/components/StructuredData'
import CartDrawer from './src/components/CartDrawer'
import CartPage from './src/components/CartPage'
import { CartProvider } from './src/hooks/useCart'
import { initCartButtonListener } from './src/utils/cartEvents'
import { applyAutoContrast } from './src/utils/autoContrast'

// Import hooks
import { useNavigation, useKeyboardNavigation } from './src/hooks/useNavigation'

// Import styles
import './src/style.css'
import { slugify } from './src/utils/slugify'

function ProductCard({ product }) {
    const [selectedSize, setSelectedSize] = useState(product.size_options[0])
    const [isAvailable, setIsAvailable] = useState(true)

    useEffect(() => {
        // Check availability for vapes and other products with availability object
        if (product.availability && typeof product.availability === 'object') {
            setIsAvailable(product.availability[selectedSize] !== false)
        }
    }, [selectedSize, product.availability])

    const currentPrice = product.prices[selectedSize]
    const isOutOfStock = product.banner === 'Out of Stock' || !isAvailable

    return (
        <div
            className={`product-card relative min-w-[285px] rounded-lg bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg sm:w-full md:w-1/2 lg:w-1/3 xl:w-1/4 dark:bg-gray-800 ${
                isOutOfStock ? 'opacity-75' : ''
            }`}
        >
            {/* Product Banner */}
            {product.banner && (
                <div
                    className={`product-banner auto-contrast ${
                        product.banner === 'New'
                            ? 'bg-green-600 text-white'
                            : product.banner === 'Out of Stock'
                              ? 'bg-red-600 text-white'
                              : 'bg-blue-600 text-white'
                    }`}
                >
                    {product.banner}
                </div>
            )}

            <div className="mb-4">
                <h3 className=" text-lg font-semibold text-gray-900 dark:text-white">
                    {product.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    {product.category || 'N/A'}
                </p>
                {product.thca_percentage ? (
                    <p className="text-sm font-medium text-green-600">
                        THCa: {product.thca_percentage}%
                    </p>
                ) : (
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        N/A
                    </p>
                )}
            </div>

            <div className="mb-4">
                <label
                    htmlFor={`size-${product.name}`}
                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    Size:
                </label>
                {product.size_options.length > 1 ? (
                    <select
                        id={`size-${product.name}`}
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        disabled={isOutOfStock}
                    >
                        {product.size_options.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                ) : (
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        {selectedSize || 'N/A'}
                    </span>
                )}
            </div>

            <div className="flex items-center justify-between">
                <div className="text-xl font-bold text-green-600">
                    ${currentPrice?.toFixed(2) || 'N/A'}
                </div>
                <button
                    className={`add-to-cart rounded-md px-4 py-2 ${
                        isOutOfStock
                            ? 'cursor-not-allowed bg-white text-black hover:text-red-600'
                            : 'bg-emerald-700 text-white transition-colors hover:bg-white hover:text-green-600 focus:outline-green-500 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 active:bg-emerald-600 active:text-white'
                    }`}
                    disabled={isOutOfStock}
                    aria-label={`Add ${product.name} to cart`}
                    data-product-id={slugify(product.name)}
                    data-variant-id={`${slugify(product.name)}_${slugify(selectedSize)}`}
                    data-name={product.name}
                    data-price={currentPrice?.toFixed(2) || 0}
                    data-currency="USD"
                    data-image=""
                    data-available={!isOutOfStock}
                >
                    <span className="text-lg font-bold">
                        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </span>
                </button>
            </div>
        </div>
    )
}

function ProductSection({ title, products, categoryId }) {
    if (!products || products.length === 0) {
        return null
    }

    return (
        <section id={categoryId} className="py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h2 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-white">
                    {title}
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((product) => (
                        <ProductCard key={product.name} product={product} />
                    ))}
                </div>
            </div>
        </section>
    )
}

function HeroSection() {
    return (
        <section
            id="home"
            className="relative bg-gradient-to-br from-green-800 to-green-900 py-20 text-white"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                        Route 66 Hemp
                    </h1>
                    <p className="mx-auto mb-8 max-w-2xl text-xl text-green-100">
                        Premium hemp products for your wellness journey. Quality
                        you can trust, service you can count on. Located in St
                        Robert, Missouri.
                    </p>
                    <div className="flex flex-col justify-center gap-4 sm:flex-row">
                        <a
                            href="#products"
                            className="inline-flex items-center rounded-lg bg-white px-8 py-3 font-medium text-green-800 transition-colors hover:bg-green-50"
                        >
                            <i
                                className="fas fa-cannabis mr-2"
                                aria-hidden="true"
                            />
                            Shop Products
                        </a>
                        <a
                            href="tel:+15736776418"
                            className="inline-flex items-center rounded-lg border-2 border-white bg-transparent px-8 py-3 font-medium text-white transition-colors hover:bg-white hover:text-green-800"
                        >
                            <i
                                className="fas fa-phone mr-2"
                                aria-hidden="true"
                            />
                            Call (573) 677-6418
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
}

function AboutSection() {
    return (
        <section id="about" className="bg-white py-16 dark:bg-gray-900">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
                            About Route 66 Hemp
                        </h2>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                            Located in the heart of St Robert, Missouri, Route
                            66 Hemp has been serving the Pulaski County
                            community and Fort Leonard Wood area with premium
                            hemp products since 2025.
                        </p>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                            We're committed to providing high-quality,
                            lab-tested hemp products that meet the highest
                            standards of purity and potency. Our knowledgeable
                            staff is here to help you find the right products
                            for your wellness journey.
                        </p>
                        <div className="mt-8">
                            <a
                                href="#location"
                                className="inline-flex items-center rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700"
                            >
                                <i
                                    className="fas fa-map-marker-alt mr-2"
                                    aria-hidden="true"
                                />
                                Visit Our Store
                            </a>
                        </div>
                    </div>
                    <div className="mt-8 lg:mt-0">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-lg bg-green-50 p-6 dark:bg-green-900">
                                <div className="flex items-center">
                                    <i
                                        className="fas fa-certificate text-2xl text-green-600"
                                        aria-hidden="true"
                                    />
                                    <div className="ml-4">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            Lab Tested
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            All products verified
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-lg bg-green-50 p-6 dark:bg-green-900">
                                <div className="flex items-center">
                                    <i
                                        className="fas fa-users text-2xl text-green-600"
                                        aria-hidden="true"
                                    />
                                    <div className="ml-4">
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            Local Experts
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            Knowledgeable staff
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

function ContactSection() {
    return (
        <section
            id="contact"
            className="flex items-center justify-center bg-gray-50 py-16 dark:bg-gray-800"
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
                        Contact Us
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                        Have questions? We're here to help!
                    </p>
                </div>
                <div className="mt-12 flex justify-center">
                    <div className="w-full max-w-md">
                        <LocalBusinessInfo />
                    </div>
                </div>
            </div>
        </section>
    )
}

function App() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Use navigation hooks for enhanced UX
    const { activeSection } = useNavigation()
    useKeyboardNavigation()

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const response = await fetch('/products/products.json')
                if (!response.ok) {
                    throw new Error('Failed to load products')
                }
                const data = await response.json()
                setProducts(data)
            } catch (err) {
                setError(err.message)
                console.error('Error loading products:', err)
            } finally {
                setLoading(false)
            }
        }

        loadProducts()
    }, [])

    useEffect(() => {
        initCartButtonListener()
    }, [])

    useEffect(() => {
        applyAutoContrast()
    }, [products])

    // Group products by category
    const productsByCategory = products.reduce((acc, product) => {
        const category = product.category
        if (!acc[category]) {
            acc[category] = []
        }
        acc[category].push(product)
        return acc
    }, {})

    // Sort products within each category (New items first, then alphabetical)
    Object.keys(productsByCategory).forEach((category) => {
        productsByCategory[category].sort((a, b) => {
            // Priority order: New -> Regular -> Out of Stock
            const getRank = (product) => {
                if (product.banner === 'New') return 0
                if (product.banner === 'Out of Stock') return 2
                return 1
            }

            const rankA = getRank(a)
            const rankB = getRank(b)

            if (rankA !== rankB) {
                return rankA - rankB
            }

            return a.name.localeCompare(b.name)
        })
    })

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="leaf-loader animate-spin"></div>
                <span className="ml-3 text-lg">Loading products...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <i
                        className="fas fa-exclamation-triangle mb-4 text-4xl text-red-500"
                        aria-hidden="true"
                    />
                    <h1 className="mb-2 text-2xl font-bold text-gray-900">
                        Error Loading Products
                    </h1>
                    <p className="text-gray-600">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Structured Data for SEO */}
            <StructuredData />

            {/* Navigation */}
            <Navigation products={products} />

            {/* Main Content */}
            <main>
                {/* Hero Section */}
                <HeroSection />

                {/* Products Section */}
                <section
                    id="products"
                    className="bg-white py-16 dark:bg-gray-900"
                >
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-12 text-center">
                            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
                                Our Premium Hemp Products
                            </h2>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                                Discover our carefully curated selection of
                                high-quality hemp products
                            </p>
                        </div>

                        {/* Product Categories */}
                        {Object.entries(productsByCategory).map(
                            ([category, categoryProducts]) => (
                                <ProductSection
                                    key={category}
                                    title={category}
                                    products={categoryProducts}
                                    categoryId={slugify(category)}
                                />
                            )
                        )}
                    </div>
                </section>

                {/* About Section */}
                <AboutSection />

                {/* Location Content */}
                <LocationContent />

                {/* Contact Section */}
                <ContactSection />

                {/* Google Business Integration */}
                <GoogleBusinessIntegration />

                {/* Local SEO FAQ */}
                <LocalSEOFAQ />
            </main>

            {/* Footer */}
            <FooterNavigation />

            {/* Quick Navigation */}
            <QuickNavigation />

            <CartDrawer />
            <CartPage />

            {/* Analytics */}
            <Analytics />
            <SpeedInsights />
        </div>
    )
}

// Render the app
const container = document.getElementById('root')
const root = createRoot(container)
root.render(
    <CartProvider>
        <App />
    </CartProvider>
)
