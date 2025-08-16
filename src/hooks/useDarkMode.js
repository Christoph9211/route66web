import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'route66-theme-preference'
const DARK_CLASS = 'dark'

/**
 * Custom hook for managing dark mode theme preference.
 *
 * @returns {Object} An object containing the current theme state and functions.
 * @property {boolean} isDark - The current theme preference.
 * @property {Function} toggle - Function to toggle the theme preference.
 * @property {Function} setTheme - Function to set the theme preference.
 * @property {boolean} isLoading - Indicates if the initial theme preference is being loaded.
 */
export function useDarkMode() {
    const [isDark, setIsDark] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Get initial theme preference
    const getInitialTheme = useCallback(() => {
        // Check if we're in the browser
        if (typeof window === 'undefined') return false

        try {
            // First, check localStorage for user preference
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored !== null) {
                return stored === 'dark'
            }

            // Fall back to system preference
            return window.matchMedia('(prefers-color-scheme: dark)').matches
        } catch (error) {
            console.warn('Error accessing localStorage or matchMedia:', error)
            return false
        }
    }, [])

    // Apply theme to document
    const applyTheme = useCallback((dark) => {
        if (typeof document === 'undefined') return

        const root = document.documentElement
        
        if (dark) {
            root.classList.add(DARK_CLASS)
        } else {
            root.classList.remove(DARK_CLASS)
        }

        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]')
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', dark ? '#1f2937' : '#ffffff')
        } else {
            // Create meta theme-color if it doesn't exist
            const meta = document.createElement('meta')
            meta.name = 'theme-color'
            meta.content = dark ? '#1f2937' : '#ffffff'
            document.head.appendChild(meta)
        }
    }, [])

    // Save preference to localStorage
    const savePreference = useCallback((dark) => {
        try {
            localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
        } catch (error) {
            console.warn('Error saving theme preference:', error)
        }
    }, [])

    // Toggle theme
    const toggle = useCallback(() => {
        setIsDark(prev => {
            const newValue = !prev
            applyTheme(newValue)
            savePreference(newValue)
            
            // Dispatch custom event for other components to listen to
            window.dispatchEvent(new CustomEvent('theme-changed', {
                detail: { isDark: newValue }
            }))
            
            return newValue
        })
    }, [applyTheme, savePreference])

    // Set specific theme
    const setTheme = useCallback((dark) => {
        setIsDark(dark)
        applyTheme(dark)
        savePreference(dark)
        
        window.dispatchEvent(new CustomEvent('theme-changed', {
            detail: { isDark: dark }
        }))
    }, [applyTheme, savePreference])

    // Initialize theme on mount
    useEffect(() => {
        const initialTheme = getInitialTheme()
        setIsDark(initialTheme)
        applyTheme(initialTheme)
        setIsLoading(false)
    }, [getInitialTheme, applyTheme])

    // Listen for system theme changes
    useEffect(() => {
        if (typeof window === 'undefined') return

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        
        const handleChange = (e) => {
            // Only update if user hasn't set a preference
            try {
                const stored = localStorage.getItem(STORAGE_KEY)
                if (stored === null) {
                    setTheme(e.matches)
                }
            } catch (error) {
                console.warn('Error checking stored preference:', error)
            }
        }

        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange)
            return () => mediaQuery.removeEventListener('change', handleChange)
        }
        // Legacy browsers
        else if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange)
            return () => mediaQuery.removeEventListener('change', handleChange)
        }
    }, [setTheme])

    // Prevent flash of wrong theme
    useEffect(() => {
        // Add transition class after initial render to prevent flash
        const timer = setTimeout(() => {
            document.documentElement.classList.add('theme-transition')
        }, 100)

        return () => clearTimeout(timer)
    }, [])

    return {
        isDark,
        toggle,
        setTheme,
        isLoading
    }
}