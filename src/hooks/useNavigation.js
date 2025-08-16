import { useState, useEffect } from 'react'

/**
 * Custom hook that provides navigation functionality for the page.
 *
 * Returns an object with the following properties:
 * - activeSection: The currently active section of the page, based on the user's scroll position.
 * - isScrolled: Indicates whether the user has scrolled more than 20 pixels from the top of the page.
 * - navigateToSection: Function to scroll to a specific section of the page.
 * - setActiveSection: Function to manually set the active section.
 *
 * The hook sets up an event listener for scroll events and updates the active section and scroll state accordingly.
 * The `navigateToSection` function scrolls to the specified section smoothly.
 * The `setActiveSection` function allows for manual control of the active section.
 *
 * @return {Object} An object with the activeSection, isScrolled, navigateToSection, and setActiveSection properties.
 */
export function useNavigation() {
    const [activeSection, setActiveSection] = useState('home')
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {

        /**
         * Handles the scroll event and updates the scroll state and active section.
         *
         * Updates the scroll state based on whether the user has scrolled more than 20 pixels from the top of the page.
         * Updates the active section based on the scroll position. The active section is determined by finding the
         * first element with an ID from the `sections` array whose top and bottom positions are both within
         * half of the viewport height of the top of the viewport.
         */
        const handleScroll = () => {
            // Update scroll state
            setIsScrolled(window.scrollY > 20)

            // Update active section based on scroll position
            const sections = ['home', 'products', 'about', 'location', 'contact', 'faq']
            let currentSection = 'home'

            for (const section of sections) {
                const element = document.getElementById(section)
                if (element) {
                    const rect = element.getBoundingClientRect()
                    // Consider a section active if it's in the top half of the viewport
                    if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
                        currentSection = section
                        break
                    }
                }
            }

            setActiveSection(currentSection)
        }

        // Throttle scroll events for better performance
        let ticking = false
        const throttledHandleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    handleScroll()
                    ticking = false
                })
                ticking = true
            }
        }

        window.addEventListener('scroll', throttledHandleScroll)
        handleScroll() // Initial call

        return () => window.removeEventListener('scroll', throttledHandleScroll)
    }, [])



    /**
     * Scrolls to the specified section of the page smoothly.
     *
     * @param {string} sectionId - The ID of the section to scroll to.
     * @return {void} No return value.
     */
    const navigateToSection = (sectionId) => {
        const element = document.getElementById(sectionId)
        if (element) {
            element.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            })
        }
        setActiveSection(sectionId)
    }

    return {
        activeSection,
        isScrolled,
        navigateToSection,
        setActiveSection
    }
}

/**
 * Hook for handling keyboard navigation.
 *
 * This hook listens for keydown events and performs actions based on the key pressed.
 * The following keys are supported:
 * - '1': Scrolls to the 'home' section smoothly.
 * - '2': Scrolls to the 'products' section smoothly.
 * - '3': Scrolls to the 'about' section smoothly.
 * - '4': Scrolls to the 'location' section smoothly.
 * - '5': Scrolls to the 'contact' section smoothly.
 * - 'Escape': Closes any open menus.
 *
 * @return {void} No return value.
 */
export function useKeyboardNavigation() {
    useEffect(() => {
    /**
     * Handles keydown events and performs actions based on the key pressed.
     * Supported keys:
     * - '1': Scrolls to the 'home' section smoothly.
     * - '2': Scrolls to the 'products' section smoothly.
     * - '3': Scrolls to the 'about' section smoothly.
     * - '4': Scrolls to the 'location' section smoothly.
     * - '5': Scrolls to the 'contact' section smoothly.
     * - 'Escape': Closes any open menus.
     *
     * @param {KeyboardEvent} event - The keyboard event.
     * @return {void} No return value.
     */
        const handleKeyDown = (event) => {
            // Skip if user is typing in an input
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
                return
            }

            switch (event.key) {
                case '1':
                    document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })
                    break
                case '2':
                    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
                    break
                case '3':
                    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
                    break
                case '4':
                    document.getElementById('location')?.scrollIntoView({ behavior: 'smooth' })
                    break
                case '5':
                    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
                    break
                case 'Escape':
                    // Close any open menus
                    const openMenus = document.querySelectorAll('[data-menu-open="true"]')
                    openMenus.forEach(menu => {
                        menu.click()
                    })
                    break
                default:
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])
}