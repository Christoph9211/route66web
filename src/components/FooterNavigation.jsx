import React from 'react'
import LocalBusinessInfo from './LocalBusinessInfo'
import { slugify } from '../utils/slugify'

/**
 * FooterNavigation is a React component that renders the footer of the website.
 * It displays business information, social links, and footer links.
 *
 * @return {JSX.Element} The FooterNavigation component.
 */
function FooterNavigation() {
    const footerSections = [
        {
            title: 'Products',
            links: [
                { label: 'Hemp Flower', category: 'Flower' },
                { label: 'Concentrates', category: 'Concentrates' },
                { label: 'Diamonds & Sauce', category: 'Diamonds & Sauce' },
                { label: 'Vapes & Carts', category: 'Vapes & Carts' },
                { label: 'Edibles', category: 'Edibles' },
                { label: 'Pre-rolls', category: 'Pre-Rolls' },
            ].map(({ label, category }) => ({
                label,
                href: `#${slugify(category)}`,
            })),
        },
        {
            title: 'Company',
            links: [
                { label: 'About Us', href: '#about' },
                { label: 'Our Story', href: '#story' },
                { label: 'Quality Promise', href: '#quality' },
                { label: 'Lab Results', href: '#lab-results' },
            ],
        },
        {
            title: 'Support',
            links: [
                { label: 'Contact Us', href: '#contact' },
                { label: 'Store Hours', href: '#hours' },
                { label: 'Directions', href: '#location' },
                { label: 'FAQ', href: '#faq' },
            ],
        },
        {
            title: 'Legal',
            links: [
                {
                    label: 'Privacy Policy',
                    href: '/privacy-policy.html',
                },
                {
                    label: 'Terms of Service',
                    href: '/terms-of-service.html',
                },
                {
                    label: 'Cookie Policy',
                    href: '/cookie-policy.html',
                },
            ],
        },
    ]

    const socialLinks = [
        {
            platform: 'Facebook',
            href: 'https://facebook.com/route66hemp',
            icon: 'fab fa-facebook-f',
            color: 'hover:text-blue-600',
        },
        {
            platform: 'Instagram',
            href: 'https://instagram.com/route66hemp',
            icon: 'fab fa-instagram',
            color: 'hover:text-pink-600',
        },
        {
            platform: 'Google',
            href: 'https://www.google.com/maps/search/Route+66+Hemp+St+Robert+MO',
            icon: 'fab fa-google',
            color: 'hover:text-red-600',
        },
    ]

    return (
        <footer className="auto-contrast bg-gray-900 text-white border-t border-gray-800">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-6">
                    {/* Business Info */}
                    <div className="lg:col-span-2">
                        <div className="mb-6">
                            <div className="mb-4 flex items-center space-x-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600">
                                    <i
                                        className="fas fa-cannabis text-xl text-white"
                                        aria-hidden="true"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">
                                        Route 66 Hemp
                                    </h3>
                                    <p className="text-sm text-gray-300">
                                        Premium Hemp Products
                                    </p>
                                </div>
                            </div>
                            <p className="mb-6 text-gray-300">
                                Your trusted local hemp store in St Robert,
                                Missouri. Serving Pulaski County and the Fort
                                Leonard Wood community with quality hemp
                                products since 2025.
                            </p>
                            <LocalBusinessInfo
                                variant="minimal"
                                className="text-gray-300"
                            />
                        </div>

                        {/* Social Links */}
                        <div>
                            <h4 className="mb-3 text-lg font-semibold">
                                Follow Us
                            </h4>
                            <div className="flex space-x-4">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.platform}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={`flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-gray-300 transition-colors ${social.color} hover:bg-gray-700`}
                                        aria-label={`Follow us on ${social.platform}`}
                                    >
                                        <i
                                            className={social.icon}
                                            aria-hidden="true"
                                        />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer Links */}
                    {footerSections.map((section) => (
                        <div key={section.title}>
                            <h4 className="mb-4 text-lg font-semibold">
                                {section.title}
                            </h4>
                            <ul className="space-y-2">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="text-sm text-gray-300 transition-colors hover:text-green-400"
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Footer */}
                <div className="mt-12 border-t border-gray-800 pt-8">
                    <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
                        <div className="text-center text-sm text-white md:text-left">
                            <p>
                                &copy; 2025 Route 66 Hemp. All rights reserved.
                            </p>
                            <p className="mt-1">
                                Licensed hemp retailer in Missouri | 21+ Only
                            </p>
                        </div>
                        <div className="flex items-center text-sm text-white">
                            <span>St Robert, MO 65584</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default FooterNavigation
