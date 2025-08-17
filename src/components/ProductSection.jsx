import React from 'react'

/**
 * ProductSection component renders a section of products with proper ARIA landmarks
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Section title
 * @param {Array} props.products - Array of products to display
 * @param {string} props.categoryId - Category ID for section identification
 * @param {Function} props.ProductCard - Product card component
 * @returns {JSX.Element|null} Product section or null if no products
 */
function ProductSection({ title, products, categoryId, ProductCard }) {
    if (!products || products.length === 0) {
        return null
    }

    return (
        <section 
            id={categoryId} 
            className="py-12"
            aria-labelledby={`${categoryId}-heading`}
        >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h2 
                    id={`${categoryId}-heading`}
                    className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-white"
                >
                    {title}
                </h2>
                <div 
                    className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    role="list"
                    aria-label={`${title} products`}
                >
                    {products.map((product) => (
                        <div key={product.name} role="listitem">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default ProductSection