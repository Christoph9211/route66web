import React from 'react'

/**
 * SkipToContent component provides a skip link for keyboard users
 * to jump directly to the main content, improving accessibility
 */
function SkipToContent() {
    return (
        <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            tabIndex="0"
        >
            Skip to main content
        </a>
    )
}

export default SkipToContent