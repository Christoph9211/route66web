import { useState, useEffect } from 'react'

export function useNavigation() {
    const [activeSection, setActiveSection] = useState('home')
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
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

export function useKeyboardNavigation() {
    useEffect(() => {
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