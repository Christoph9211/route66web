import React, { useState, useEffect } from 'react'

function ThemeToggle() {
    const [theme, setTheme] = useState('system')
    const [mounted, setMounted] = useState(false)

    // Initialize theme on component mount
    useEffect(() => {
        setMounted(true)
        
        // Get stored theme preference or default to 'system'
        const storedTheme = localStorage.getItem('theme') || 'system'
        setTheme(storedTheme)
        
        // Apply initial theme
        applyTheme(storedTheme)
        
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleSystemThemeChange = () => {
            if (theme === 'system') {
                applyTheme('system')
            }
        }
        
        mediaQuery.addEventListener('change', handleSystemThemeChange)
        
        return () => {
            mediaQuery.removeEventListener('change', handleSystemThemeChange)
        }
    }, [])

    // Apply theme to document
    const applyTheme = (newTheme) => {
        const root = document.documentElement
        
        // Remove existing theme attributes
        root.removeAttribute('data-theme')
        
        if (newTheme === 'dark') {
            root.setAttribute('data-theme', 'dark')
        } else if (newTheme === 'light') {
            root.setAttribute('data-theme', 'light')
        } else {
            // System preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            if (prefersDark) {
                root.setAttribute('data-theme', 'dark')
            } else {
                root.setAttribute('data-theme', 'light')
            }
        }
    }

    // Toggle between themes
    const toggleTheme = () => {
        let newTheme
        
        if (theme === 'light') {
            newTheme = 'dark'
        } else if (theme === 'dark') {
            newTheme = 'system'
        } else {
            newTheme = 'light'
        }
        
        setTheme(newTheme)
        localStorage.setItem('theme', newTheme)
        applyTheme(newTheme)
        
        // Announce theme change to screen readers
        const announcement = `Theme changed to ${newTheme === 'system' ? 'system preference' : newTheme} mode`
        announceToScreenReader(announcement)
    }

    // Announce changes to screen readers
    const announceToScreenReader = (message) => {
        const announcement = document.createElement('div')
        announcement.setAttribute('aria-live', 'polite')
        announcement.setAttribute('aria-atomic', 'true')
        announcement.className = 'sr-only'
        announcement.textContent = message
        
        document.body.appendChild(announcement)
        
        setTimeout(() => {
            document.body.removeChild(announcement)
        }, 1000)
    }

    // Get current effective theme for display
    const getEffectiveTheme = () => {
        if (theme === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        }
        return theme
    }

    // Don't render until mounted to prevent hydration mismatch
    if (!mounted) {
        return (
            <div className="theme-toggle" aria-hidden="true">
                <i className="fas fa-circle-notch fa-spin icon" />
            </div>
        )
    }

    const effectiveTheme = getEffectiveTheme()
    const themeLabels = {
        light: 'Light mode',
        dark: 'Dark mode',
        system: 'System preference'
    }

    return (
        <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Current theme: ${themeLabels[theme]}. Click to cycle through themes.`}
            title={`Current: ${themeLabels[theme]} (${effectiveTheme}). Click to change.`}
            type="button"
        >
            {/* Sun icon for light mode */}
            <i 
                className="fas fa-sun icon sun-icon" 
                aria-hidden="true"
            />
            
            {/* Moon icon for dark mode */}
            <i 
                className="fas fa-moon icon moon-icon" 
                aria-hidden="true"
            />
            
            {/* Screen reader only text */}
            <span className="sr-only">
                Toggle theme. Current: {themeLabels[theme]} ({effectiveTheme})
            </span>
        </button>
    )
}

export default ThemeToggle