import React, { useState, useEffect, useRef } from 'react'

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

        const filtered = products.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase()) ||
            product.size_options.some(size => 
                size.toLowerCase().includes(query.toLowerCase())
            )
        ).slice(0, 8) // Limit to 8 results

        setResults(filtered)
        setSelectedIndex(-1)
    }, [query, products])

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault()
                    setSelectedIndex(prev => 
                        prev < results.length - 1 ? prev + 1 : prev
                    )
                    break
                case 'ArrowUp':
                    e.preventDefault()
                    setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
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
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleResultClick = (product) => {
        // Navigate to product or category
        const categoryElement = document.getElementById(
            product.category.toLowerCase().replace(/\s+/g, '-')
        )
        if (categoryElement) {
            categoryElement.scrollIntoView({ behavior: 'smooth' })
        }
        setIsOpen(false)
        setQuery('')
    }

    const highlightMatch = (text, query) => {
        if (!query) return text
        
        const regex = new RegExp(`(${query})`, 'gi')
        const parts = text.split(regex)
        
        return parts.map((part, index) => 
            regex.test(part) ? (
                <mark key={index} className="bg-yellow-200 dark:bg-yellow-800">
                    {part}
                </mark>
            ) : part
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
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-center pt-20">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4">
                        {/* Search Input */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="relative">
                                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" aria-hidden="true" />
                                <input
                                    type="text"
                                    placeholder="Search products, categories, or sizes..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    autoFocus
                                />
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <i className="fas fa-times" aria-hidden="true" />
                                </button>
                            </div>
                        </div>

                        {/* Search Results */}
                        <div ref={resultsRef} className="max-h-96 overflow-y-auto">
                            {query.length >= 2 && results.length === 0 && (
                                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                    <i className="fas fa-search text-2xl mb-2" aria-hidden="true" />
                                    <p>No products found for "{query}"</p>
                                </div>
                            )}

                            {results.map((product, index) => (
                                <button
                                    key={product.name}
                                    onClick={() => handleResultClick(product)}
                                    className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors ${
                                        index === selectedIndex ? 'bg-green-50 dark:bg-green-900' : ''
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                {highlightMatch(product.name, query)}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                {highlightMatch(product.category, query)}
                                            </p>
                                            <div className="flex items-center mt-1 text-xs text-gray-500">
                                                <span>Sizes: {product.size_options.join(', ')}</span>
                                                {product.thca_percentage && (
                                                    <span className="ml-2">
                                                        THCa: {product.thca_percentage}%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-green-600">
                                                From ${Math.min(...Object.values(product.prices))}
                                            </div>
                                            {product.banner && (
                                                <span className={`inline-block px-2 py-1 text-xs rounded ${
                                                    product.banner === 'New' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
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
                                    {['Flower', 'Concentrates', 'Vapes', 'Edibles', '1 gram', 'Snowcaps'].map(term => (
                                        <button
                                            key={term}
                                            onClick={() => setQuery(term)}
                                            className="px-2 py-1 bg-gray-100 rounded text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
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