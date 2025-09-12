import React, { useState, useEffect } from 'react'

/**
 * Renders a quick navigation component that provides quick access to
 * various sections of the page and a call button.
 *
 * The quick navigation component is visible when the user scrolls down 300px
 * from the top of the page. It displays a call button and a set of buttons
 * that navigate to different sections of the page. The active section is
 * determined by finding the first element with an ID from the `sections` array
 * whose top and bottom positions are both within 100px of the top of the
 * viewport.
 *
 * @return {JSX.Element} The quick navigation component.
 */
function QuickNavigation() {
    const [isVisible, setIsVisible] = useState(false)
    const [activeSection, setActiveSection] = useState('')

    const quickLinks = [
        { id: 'products', label: 'Products', icon: 'fas fa-cannabis' },
        { id: 'location', label: 'Visit Us', icon: 'fas fa-map-marker-alt' },
        { id: 'contact', label: 'Contact', icon: 'fas fa-phone' },
        { id: 'top', label: 'Top', icon: 'fas fa-arrow-up' },
    ]

    useEffect(() => {
    /**
     * Handles the scroll event and updates the state of the quick navigation
     * based on the scroll position.
     *
     * This function is called whenever the window is scrolled. It checks if the
     * scroll position is greater than 300px and updates the `isVisible` state
     * accordingly. It also updates the `activeSection` state based on the
     * current scroll position. The active section is determined by finding the
     * first element with an ID from the `sections` array whose top and bottom
     * positions are both within 100px of the top of the viewport.
     *
     * @return {void} No return value.
     */
        const handleScroll = () => {
            // Show quick nav after scrolling down 300px
            setIsVisible(window.scrollY > 300)

            // Update active section based on scroll position
            const sections = ['home', 'products', 'about', 'location', 'contact']
            const currentSection = sections.find(section => {
                const element = document.getElementById(section)
                if (element) {
                    const rect = element.getBoundingClientRect()
                    return rect.top <= 100 && rect.bottom >= 100
                }
                return false
            })
            
            if (currentSection) {
                setActiveSection(currentSection)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    /**
     * Handles a click on a quick navigation link.
     *
     * @param {string} id - The ID of the link that was clicked.
     *                     If "top", scrolls to the top of the page smoothly.
     *                     Otherwise, scrolls to the element with the given ID.
     */
    const handleQuickNavClick = (id) => {
        if (id === 'top') {
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
            const element = document.getElementById(id)
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
            }
        }
    }

    return (
        <div className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}>
            {/* Quick Action Buttons */}
            <div className="flex flex-col space-y-2">
                {/* Call Button - Always Visible */}
                <a
                    href="tel:+15736776418"
                    className=" auto-contrast flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 transition-colors group"
                    aria-label="Call Route 66 Hemp"
                >
                    <i className="fas fa-phone group-hover:animate-pulse" aria-hidden="true" />
                </a>

                {/* Navigation Buttons */}
                {quickLinks.map((link) => (
                    <button
                        key={link.id}
                        onClick={() => handleQuickNavClick(link.id)}
                        className={`flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all duration-200 ${
                            activeSection === link.id
                                ? 'bg-blue-600 text-white scale-110'
                                : 'bg-white text-gray-700 hover:bg-gray-50 hover:scale-105 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                        }`}
                        aria-label={`Go to ${link.label}`}
                        title={link.label}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                handleQuickNavClick(link.id)
                            }
                        }}
                    >
                        <i className={`${link.icon} text-sm`} aria-hidden="true" />
                    </button>
                ))}
            </div>
        </div>
    )
}

export default QuickNavigation