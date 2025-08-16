import React, { useState, useEffect } from 'react'
import { useDarkMode } from '../hooks/useDarkMode'

/**
 * A component that toggles the dark mode state and animates the button.
 * 
 * @param {string} className - An optional class name to apply to the component.
 * @returns {JSX.Element} A button component that toggles the dark mode state and animates the button.
 */
function DarkModeToggle({ className = '' }) {
    const { isDark, toggle, isLoading } = useDarkMode()
    const [isAnimating, setIsAnimating] = useState(false)

    /**
     * Toggles the dark mode state, animates the button, and resets the animation state after a transition.
     *
     * @return {void}
     */
    const handleToggle = () => {
        setIsAnimating(true)
        toggle()
        
        // Reset animation state after transition
        setTimeout(() => {
            setIsAnimating(false)
        }, 300)
    }

    // Don't render during initial load to prevent flash
    if (isLoading) {
        return (
            <div className={`h-10 w-10 ${className}`} aria-hidden="true">
                <div className="animate-pulse rounded-full bg-gray-200 h-full w-full dark:bg-gray-700" />
            </div>
        )
    }

    return (
        <button
            onClick={handleToggle}
            className={`
                relative inline-flex h-10 w-10 items-center justify-center
                rounded-full border-2 border-transparent
                bg-gray-100 text-gray-700 transition-all duration-300 ease-in-out
                hover:bg-gray-200 hover:scale-105
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700
                dark:focus:ring-blue-400 dark:focus:ring-offset-gray-900
                ${isAnimating ? 'scale-95' : ''}
                ${className}
            `}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            aria-pressed={isDark}
            role="switch"
            type="button"
        >
            {/* Sun Icon */}
            <svg
                className={`
                    absolute h-5 w-5 transition-all duration-300 ease-in-out
                    ${isDark 
                        ? 'rotate-90 scale-0 opacity-0' 
                        : 'rotate-0 scale-100 opacity-100'
                    }
                `}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                />
            </svg>

            {/* Moon Icon */}
            <svg
                className={`
                    absolute h-5 w-5 transition-all duration-300 ease-in-out
                    ${isDark 
                        ? 'rotate-0 scale-100 opacity-100' 
                        : '-rotate-90 scale-0 opacity-0'
                    }
                `}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
            >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>

            {/* Screen reader text */}
            <span className="sr-only">
                {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            </span>
        </button>
    )
}

export default DarkModeToggle