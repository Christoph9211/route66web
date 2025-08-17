import React from 'react'

/**
 * Renders a breadcrumb navigation component based on the provided props.
 * 
 * @param {Object} props - The props object containing the following properties:
 *   - currentPage: The current page being viewed.
 *   - category: The category of the current page.
 *   - productName: The name of the current product.
 * @return {JSX.Element|null} The breadcrumb navigation component or null if there is only one breadcrumb.
 */
function BreadcrumbNavigation({ currentPage, category, productName }) {
    const breadcrumbs = [
        { label: 'Home', href: '#home', icon: 'fas fa-home' },
    ]

    // Add category if provided
    if (category) {
        breadcrumbs.push({
            label: category,
            href: `#${category.toLowerCase().replace(/\s+/g, '-')}`,
        })
    }

    // Add current page
    if (currentPage && currentPage !== 'Home') {
        breadcrumbs.push({
            label: productName || currentPage,
            href: null, // Current page, no link
        })
    }

    if (breadcrumbs.length <= 1) return null

    return (
        <nav className="auto-contrast bg-gray-50 py-3 dark:bg-gray-800" aria-label="Breadcrumb">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <ol className="flex items-center space-x-2 text-sm">
                    {breadcrumbs.map((crumb, index) => (
                        <li key={index} className="flex items-center">
                            {index > 0 && (
                                <i 
                                    className="fas fa-chevron-right mx-2 text-xs text-gray-400" 
                                    aria-hidden="true" 
                                />
                            )}
                            {crumb.href ? (
                                <a
                                    href={crumb.href}
                                    className="flex items-center text-gray-600 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400"
                                >
                                    {crumb.icon && (
                                        <i className={`${crumb.icon} mr-1`} aria-hidden="true" />
                                    )}
                                    {crumb.label}
                                </a>
                            ) : (
                                <span className="flex items-center text-gray-900 font-medium dark:text-white">
                                    {crumb.icon && (
                                        <i className={`${crumb.icon} mr-1`} aria-hidden="true" />
                                    )}
                                    {crumb.label}
                                </span>
                            )}
                        </li>
                    ))}
                </ol>
            </div>
        </nav>
    )
}

export default BreadcrumbNavigation