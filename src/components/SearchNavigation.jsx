import React, { useState, useEffect, useRef } from 'react'
import { slugify } from '../utils/slugify'

/**
 * SearchNavigation is a React component that provides a search functionality for products, categories, and sizes.
 * It displays a search bar and allows users to search for products based on their names, categories, or sizes.
 * Results are displayed in a dropdown below the search bar, and users can click on a result to navigate to the product or category section on the page.
 * The component uses React hooks to manage state and handle user interactions.
 *
 * @param {Array} products - An array of product objects to search through.
 * @return {JSX.Element} A React component that displays a search bar and search results dropdown.
 */
function SearchNavigation({ products = [] }) {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const searchRef = useRef(null)
    const resultsRef = useRef(null)

    // Filter products based on search query
    useEffect(() => {
        if (query.length < 2) {
            setResults([])
            return
        }

        const filtered = products
            .filter(
                (product) =>
                    product.name.toLowerCase().includes(query.toLowerCase()) ||
                    product.category
                        .toLowerCase()
                        .includes(query.toLowerCase()) ||
                    product.size_options.some((size) =>
                        size.toLowerCase().includes(query.toLowerCase())
                    )
            )
            .slice(0, 8) // Limit to 8 results

        setResults(filtered)
        setSelectedIndex(-1)
    }, [query, products])

    // Handle keyboard navigation
    useEffect(() => {
    /**
     * Handles keydown events for search navigation.
     *
     * @param {KeyboardEvent} e - The keyboard event.
     * @return {void}
     */
        const handleKeyDown = (e) => {
            if (!isOpen) return

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault()
                    setSelectedIndex((prev) =>
                        prev < results.length - 1 ? prev + 1 : prev
                    )
                    break
                case 'ArrowUp':
                    e.preventDefault()
                    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
                    break
                case 'Enter':
                    e.preventDefault()
                    if (selectedIndex >= 0 && results[selectedIndex]) {
                        handleResultClick(results[selectedIndex])
                    }
                    break
                case 'Escape':
                    setIsOpen(false)
                    setQuery('')
                    break
                default:
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, results, selectedIndex])

    // Close search when clicking outside
    useEffect(() => {
        /**
         * Handles the click event outside the search box.
         * If the click event target is not within the search box,
         * it closes the search box.
         *
         * @param {Event} event - the click event
         */
        const handleClickOutside = (event) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target)
            ) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () =>
            document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    /**
     * Handles the click event on a search result.
     * 
     * @param {Object} product - The product object representing the search result.
     * @return {void} This function does not return anything.
     * 
     * Navigates to the product or category section on the page 
     * and closes the search bar.
     */
    const handleResultClick = (product) => {
        // Navigate to product or category
        const categoryElement = document.getElementById(
            slugify(product.category)
        )
        if (categoryElement) {
            categoryElement.scrollIntoView({ behavior: 'smooth' })
        }
        setIsOpen(false)
        setQuery('')
    }

    /**
     * Highlights the occurrences of a query in a given text.
     *
     * @param {string} text - The text to search for occurrences of the query.
     * @param {string} query - The query to search for in the text.
     * @return {JSX.Element[]} An array of JSX elements, where the occurrences of the query are wrapped in a mark element.
     */
    const highlightMatch = (text, query) => {
        if (!query) return text

        const regex = new RegExp(`(${query})`, 'gi')
        const parts = text.split(regex)

        return parts.map((part, index) =>
            regex.test(part) ? (
                <mark key={index} className="bg-yellow-200 dark:bg-yellow-800">
                    {part}
                </mark>
            ) : (
                part
            )
        )
    }

    return (
        <div ref={searchRef} className="relative">
            {/* Search Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400"
                aria-label="Search products"
            >
                <i className="fas fa-search mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Search</span>
            </button>

            {/* Search Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 pt-20">
                    <div className="mx-4 w-full max-w-2xl rounded-lg bg-white shadow-xl dark:bg-gray-800">
                        {/* Search Input */}
                        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                            <div className="relative">
                                <i
                                    className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                                    aria-hidden="true"
                                />
                                <input
                                    type="text"
                                    placeholder="Search products, categories, or sizes..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    autoFocus
                                />
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-400 hover:text-gray-600"
                                >
                                    <span className="sr-only">Close search</span>
                                    <i
                                        className="fas fa-times"
                                        aria-hidden="true"
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Search Results */}
                        <div
                            ref={resultsRef}
                            className="max-h-96 overflow-y-auto"
                        >
                            {query.length >= 2 && results.length === 0 && (
                                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                    <i
                                        className="fas fa-search mb-2 text-2xl"
                                        aria-hidden="true"
                                    />
                                    <p>No products found for "{query}"</p>
                                </div>
                            )}

                            {results.map((product, index) => (
                                <button
                                    key={product.name}
                                    onClick={() => handleResultClick(product)}
                                    className={`w-full border-b border-gray-100 p-4 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 ${
                                        index === selectedIndex
                                            ? 'bg-green-50 dark:bg-green-900'
                                            : ''
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                {highlightMatch(
                                                    product.name,
                                                    query
                                                )}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                {highlightMatch(
                                                    product.category,
                                                    query
                                                )}
                                            </p>
                                            <div className="mt-1 flex items-center text-xs text-gray-500">
                                                <span>
                                                    Sizes:{' '}
                                                    {product.size_options.join(
                                                        ', '
                                                    )}
                                                </span>
                                                {product.thca_percentage && (
                                                    <span className="ml-2">
                                                        THCa:{' '}
                                                        {
                                                            product.thca_percentage
                                                        }
                                                        %
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-green-600">
                                                From $
                                                {Math.min(
                                                    ...Object.values(
                                                        product.prices
                                                    )
                                                )}
                                            </div>
                                            {product.banner && (
                                                <span
                                                    className={`inline-block rounded px-2 py-1 text-xs ${
                                                        product.banner === 'New'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {product.banner}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Search Tips */}
                        {query.length < 2 && (
                            <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                                <p className="mb-2">Try searching for:</p>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        'Flower',
                                        'Concentrates',
                                        'Vapes',
                                        'Edibles',
                                        '1 gram',
                                        'Snowcaps',
                                    ].map((term) => (
                                        <button
                                            key={term}
                                            onClick={() => setQuery(term)}
                                            className="rounded bg-gray-100 px-2 py-1 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                        >
                                            {term}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default SearchNavigation
