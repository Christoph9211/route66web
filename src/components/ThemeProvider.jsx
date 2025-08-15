import React, { createContext, useContext, useEffect } from 'react'
import { useDarkMode } from '../hooks/useDarkMode'

const ThemeContext = createContext({
    isDark: false,
    toggle: () => {},
    setTheme: () => {},
    isLoading: true
})

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

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}

export default ThemeProvider