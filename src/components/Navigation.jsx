import React, { useState, useEffect } from 'react'
import LocalBusinessInfo from './LocalBusinessInfo'
import SearchNavigation from './SearchNavigation'

function Navigation({ products = [] }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [activeSection, setActiveSection] = useState('home')

    // Handle scroll effects
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Navigation items with clear hierarchy
    const navigationItems = [
        {
            id: 'home',
            label: 'Home',
            href: '#home',
            icon: 'fas fa-home',
        },
        {
            id: 'products',
            label: 'Products',
            href: '#products',
            icon: 'fas fa-cannabis',
            submenu: [
                { label: 'Flower', href: '#flower', category: 'Flower' },
                {
                    label: 'Concentrates',
                    href: '#concentrates',
                    category: 'Concentrates',
                },
                {
                    label: 'Diamonds & Sauce',
                    href: '#diamonds',
                    category: 'Diamonds & Sauce',
                },
                {
                    label: 'Vapes & Carts',
                    href: '#vapes',
                    category: 'Vapes & Carts',
                },
                { label: 'Edibles', href: '#edibles', category: 'Edibles' },
                { label: 'Pre-rolls', href: '#prerolls', category: 'Pre-Rolls' },
            ],
        },
        {
            id: 'about',
            label: 'About Us',
            href: '#about',
            icon: 'fas fa-info-circle',
        },
        {
            id: 'location',
            label: 'Visit Us',
            href: '#location',
            icon: 'fas fa-map-marker-alt',
        },
        {
            id: 'contact',
            label: 'Contact',
            href: '#contact',
            icon: 'fas fa-phone',
        },
    ]

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    const closeMenu = () => {
        setIsMenuOpen(false)
    }

    const handleNavClick = (e, href, id) => {
        e.preventDefault()
        setActiveSection(id)
        closeMenu()

        // Smooth scroll to section
        const element = document.querySelector(href)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <>
            {/* Main Navigation Header */}
            <header
                className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
                    isScrolled
                        ? 'bg-white/95 shadow-lg backdrop-blur-md dark:bg-gray-900/95'
                        : 'bg-transparent'
                }`}
            >
                <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo/Brand */}
                        <div className="flex items-center">
                            <a
                                href="#home"
                                className="flex items-center space-x-2"
                                onClick={(e) =>
                                    handleNavClick(e, '#home', 'home')
                                }
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600">
                                    <i
                                        className="fas fa-cannabis text-white"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className="hidden sm:block">
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                                        Route 66 Hemp
                                    </span>
                                    <div className="text-xs text-gray-600 dark:text-gray-300">
                                        St Robert, MO
                                    </div>
                                </div>
                            </a>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                {navigationItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="group relative"
                                    >
                                        <a
                                            href={item.href}
                                            onClick={(e) =>
                                                handleNavClick(
                                                    e,
                                                    item.href,
                                                    item.id
                                                )
                                            }
                                            aria-current={
                                                activeSection === item.id
                                                    ? 'page'
                                                    : undefined
                                            }
                                            aria-haspopup={
                                                item.submenu
                                                    ? 'true'
                                                    : undefined
                                            }
                                            aria-expanded={
                                                item.submenu
                                                    ? 'false'
                                                    : undefined
                                            }
                                            className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                                                activeSection === item.id
                                                    ? 'bg-green-600 text-white'
                                                    : 'text-gray-700 hover:bg-green-50 hover:text-green-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-green-400'
                                            }`}
                                        >
                                            <i
                                                className={`${item.icon} mr-2 text-sm`}
                                                aria-hidden="true"
                                            />
                                            {item.label}
                                            {item.submenu && (
                                                <i
                                                    className="fas fa-chevron-down ml-1 text-xs"
                                                    aria-hidden="true"
                                                />
                                            )}
                                        </a>

                                        {/* Desktop Dropdown */}
                                        {item.submenu && (
                                            <div
                                                className="invisible absolute left-0 mt-2 w-48 rounded-md bg-white opacity-0 shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-200 group-hover:visible group-hover:opacity-100 dark:bg-gray-800"
                                                role="menu"
                                                aria-label={`${item.label} submenu`}
                                            >
                                                <div
                                                    className="py-1"
                                                    role="none"
                                                >
                                                    {item.submenu.map(
                                                        (subItem) => (
                                                            <a
                                                                key={
                                                                    subItem.label
                                                                }
                                                                href={
                                                                    subItem.href
                                                                }
                                                                onClick={(e) =>
                                                                    handleNavClick(
                                                                        e,
                                                                        subItem.href,
                                                                        item.id
                                                                    )
                                                                }
                                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-green-400"
                                                                role="menuitem"
                                                            >
                                                                {subItem.label}
                                                            </a>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact Info & Mobile Menu Button */}
                        <div className="flex items-center space-x-4">
                            {/* Search Component */}
                            <SearchNavigation products={products} />

                            {/* Quick Contact (Desktop) */}
                            <div className="hidden items-center space-x-4 text-sm lg:flex">
                                <a
                                    href="tel:+15736776418"
                                    className="flex items-center text-gray-700 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400"
                                >
                                    <i
                                        className="fas fa-phone mr-1"
                                        aria-hidden="true"
                                    />
                                    (573) 677-6418
                                </a>
                            </div>

                            {/* Mobile menu button */}
                            <button
                                onClick={toggleMenu}
                                aria-expanded={isMenuOpen}
                                aria-controls="mobile-menu"
                                aria-label="Toggle navigation menu"
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-green-50 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-500 md:hidden dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-green-400"
                            >
                                <span className="sr-only">Open main menu</span>
                                <i
                                    className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}
                                    aria-hidden="true"
                                />
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Mobile Navigation Menu */}
                <div
                    className={`transition-all duration-300 ease-in-out md:hidden ${
                        isMenuOpen
                            ? 'max-h-screen opacity-100'
                            : 'max-h-0 overflow-hidden opacity-0'
                    }`}
                    id="mobile-menu"
                >
                    <div className="border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                        <div className="space-y-1 px-2 pb-3 pt-2">
                            {navigationItems.map((item) => (
                                <div key={item.id}>
                                    <a
                                        href={item.href}
                                        onClick={(e) =>
                                            handleNavClick(
                                                e,
                                                item.href,
                                                item.id
                                            )
                                        }
                                        aria-current={
                                            activeSection === item.id
                                                ? 'page'
                                                : undefined
                                        }
                                        className={`flex items-center rounded-md px-3 py-2 text-base font-medium transition-colors ${
                                            activeSection === item.id
                                                ? 'bg-green-600 text-white'
                                                : 'text-gray-700 hover:bg-green-50 hover:text-green-600 dark:text-gray-300 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        <i
                                            className={`${item.icon} mr-3`}
                                            aria-hidden="true"
                                        />
                                        {item.label}
                                    </a>

                                    {/* Mobile Submenu */}
                                    {item.submenu && (
                                        <div
                                            className="ml-6 mt-1 space-y-1"
                                            role="menu"
                                            aria-label={`${item.label} submenu`}
                                        >
                                            {item.submenu.map((subItem) => (
                                                <a
                                                    key={subItem.label}
                                                    href={subItem.href}
                                                    onClick={(e) =>
                                                        handleNavClick(
                                                            e,
                                                            subItem.href,
                                                            item.id
                                                        )
                                                    }
                                                    className="block px-3 py-2 text-sm text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
                                                    role="menuitem"
                                                >
                                                    {subItem.label}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Mobile Contact Info */}
                        <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
                            <LocalBusinessInfo
                                variant="minimal"
                                className="text-gray-600 dark:text-gray-300"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Spacer to prevent content from hiding behind fixed header */}
            <div className="h-16"></div>
        </>
    )
}

export default Navigation
