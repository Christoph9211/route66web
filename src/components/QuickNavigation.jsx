import React, { useState, useEffect } from 'react'

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
        const handleScroll = () => {
            // Show quick nav after scrolling down 300px
            setIsVisible(window.scrollY > 300)

            // Update active section based on scroll position
            const sections = [
                'home',
                'products',
                'about',
                'location',
                'contact',
            ]
            const currentSection = sections.find((section) => {
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
        <div
            className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${
                isVisible
                    ? 'translate-y-0 opacity-100'
                    : 'pointer-events-none translate-y-4 opacity-0'
            }`}
        >
            {/* Quick Action Buttons */}
            <div className="flex flex-col space-y-2">
                {/* Call Button - Always Visible */}
                <a
                    href="tel:+15736776418"
                    className="group flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition-colors hover:bg-green-700"
                    aria-label="Call Route 66 Hemp"
                >
                    <i
                        className="fas fa-phone group-hover:animate-pulse"
                        aria-hidden="true"
                    />
                </a>

                {/* Navigation Buttons */}
                {quickLinks.map((link) => (
                    <button
                        key={link.id}
                        onClick={() => handleQuickNavClick(link.id)}
                        className={`flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all duration-200 ${
                            activeSection === link.id
                                ? 'scale-110 bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:scale-105 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
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
                        <i
                            className={`${link.icon} text-sm`}
                            aria-hidden="true"
                        />
                    </button>
                ))}
            </div>
        </div>
    )
}

export default QuickNavigation
