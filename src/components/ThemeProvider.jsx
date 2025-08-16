import React, { createContext, useContext, useEffect } from 'react'
import { useDarkMode } from '../hooks/useDarkMode'

const ThemeContext = createContext({
    isDark: false,
    toggle: () => {},
    setTheme: () => {},
    isLoading: true
})

/**
 * ThemeProvider component wraps the application and provides access to the
 * current theme state and functions to toggle the theme. It also announces
 * theme changes to screen readers.
 * 
 * @param {Object} props - The component properties.
 * @param {ReactNode} props.children - The child components.
 * @returns {ReactNode} - The rendered component.
 */
export function ThemeProvider({ children }) {
    const darkMode = useDarkMode()

    // Announce theme changes to screen readers
    useEffect(() => {
        if (!darkMode.isLoading) {
            const announcement = `Theme changed to ${darkMode.isDark ? 'dark' : 'light'} mode`
            
            // Create a temporary element for screen reader announcement
            const announcer = document.createElement('div')
            announcer.setAttribute('aria-live', 'polite')
            announcer.setAttribute('aria-atomic', 'true')
            announcer.className = 'sr-only'
            announcer.textContent = announcement
            
            document.body.appendChild(announcer)
            
            // Remove after announcement
            setTimeout(() => {
                document.body.removeChild(announcer)
            }, 1000)
        }
    }, [darkMode.isDark, darkMode.isLoading])

    return (
        <ThemeContext.Provider value={darkMode}>
            {children}
        </ThemeContext.Provider>
    )
}

/**
 * Custom hook that provides the current theme state and functions. It must be
 * used within a ThemeProvider component.
 *
 * @throws {Error} Throws an error if not used within a ThemeProvider.
 * @return {Object} The current theme state and functions.
 */
export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}

export default ThemeProvider