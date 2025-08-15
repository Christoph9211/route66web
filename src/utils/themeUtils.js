/**
 * Theme utility functions for consistent theme management
 */

export const THEME_STORAGE_KEY = 'route66-theme-preference'
export const THEME_CLASSES = {
    DARK: 'dark',
    TRANSITION: 'theme-transition'
}

/**
 * Get the user's theme preference from localStorage
 */
export function getStoredTheme() {
    try {
        return localStorage.getItem(THEME_STORAGE_KEY)
    } catch (error) {
        console.warn('Unable to access localStorage for theme preference:', error)
        return null
    }
}

/**
 * Save theme preference to localStorage
 */
export function saveThemePreference(theme) {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch (error) {
        console.warn('Unable to save theme preference to localStorage:', error)
    }
}

/**
 * Get system theme preference
 */
export function getSystemTheme() {
    if (typeof window === 'undefined') return 'light'
    
    try {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } catch (error) {
        console.warn('Unable to detect system theme preference:', error)
        return 'light'
    }
}

/**
 * Get the effective theme (user preference or system preference)
 */
export function getEffectiveTheme() {
    const stored = getStoredTheme()
    if (stored) return stored
    
    return getSystemTheme()
}

/**
 * Apply theme to document
 */
export function applyTheme(theme) {
    if (typeof document === 'undefined') return
    
    const root = document.documentElement
    
    if (theme === 'dark') {
        root.classList.add(THEME_CLASSES.DARK)
    } else {
        root.classList.remove(THEME_CLASSES.DARK)
    }
    
    // Update meta theme-color for mobile browsers
    updateMetaThemeColor(theme === 'dark')
}

/**
 * Update meta theme-color for mobile browsers
 */
export function updateMetaThemeColor(isDark) {
    if (typeof document === 'undefined') return
    
    const color = isDark ? '#1f2937' : '#ffffff'
    let metaThemeColor = document.querySelector('meta[name="theme-color"]')
    
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', color)
    } else {
        metaThemeColor = document.createElement('meta')
        metaThemeColor.name = 'theme-color'
        metaThemeColor.content = color
        document.head.appendChild(metaThemeColor)
    }
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion() {
    if (typeof window === 'undefined') return false
    
    try {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch (error) {
        return false
    }
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast() {
    if (typeof window === 'undefined') return false
    
    try {
        return window.matchMedia('(prefers-contrast: high)').matches
    } catch (error) {
        return false
    }
}

/**
 * Get WCAG compliant color contrast ratio
 */
export function getContrastRatio(color1, color2) {
    // Simplified contrast ratio calculation
    // In a real implementation, you'd want a more robust color parsing library
    const getLuminance = (color) => {
        // This is a simplified version - you'd want proper color parsing
        const rgb = color.match(/\d+/g)
        if (!rgb) return 0
        
        const [r, g, b] = rgb.map(x => {
            x = parseInt(x) / 255
            return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
        })
        
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    
    const lum1 = getLuminance(color1)
    const lum2 = getLuminance(color2)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    
    return (brightest + 0.05) / (darkest + 0.05)
}

/**
 * Validate if color combination meets WCAG AA standards
 */
export function meetsWCAGAA(foreground, background) {
    return getContrastRatio(foreground, background) >= 4.5
}

/**
 * Validate if color combination meets WCAG AAA standards
 */
export function meetsWCAGAAA(foreground, background) {
    return getContrastRatio(foreground, background) >= 7
}