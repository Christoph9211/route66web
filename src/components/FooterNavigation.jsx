import React from 'react'
import LocalBusinessInfo from './LocalBusinessInfo'

function FooterNavigation() {
    const footerSections = [
        {
            title: 'Products',
            links: [
                { label: 'Hemp Flower', href: '#flower' },
                { label: 'Concentrates', href: '#concentrates' },
                { label: 'Diamonds & Sauce', href: '#diamonds' },
                { label: 'Vapes & Cartridges', href: '#vapes' },
                { label: 'Edibles', href: '#edibles' },
                { label: 'Pre-rolls', href: '#prerolls' },
            ],
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
                { label: 'Privacy Policy', href: '/src/privacy-policy.html' },
                { label: 'Terms of Service', href: '/src/terms-of-service.html' },
                { label: 'Age Verification', href: '#age-verification' },
                { label: 'Compliance', href: '#compliance' },
            ],
        },
    ]

    const socialLinks = [
        { 
            platform: 'Facebook', 
            href: 'https://facebook.com/route66hemp', 
            icon: 'fab fa-facebook-f',
            color: 'hover:text-blue-600'
        },
        { 
            platform: 'Instagram', 
            href: 'https://instagram.com/route66hemp', 
            icon: 'fab fa-instagram',
            color: 'hover:text-pink-600'
        },
        { 
            platform: 'Google', 
            href: 'https://www.google.com/maps/search/Route+66+Hemp+St+Robert+MO', 
            icon: 'fab fa-google',
            color: 'hover:text-red-600'
        },
    ]

    return (
        <footer className="bg-gray-900 text-white">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                    {/* Business Info */}
                    <div className="lg:col-span-2">
                        <div className="mb-6">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600">
                                    <i className="fas fa-cannabis text-white text-xl" aria-hidden="true" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Route 66 Hemp</h3>
                                    <p className="text-gray-300 text-sm">Premium Hemp Products</p>
                                </div>
                            </div>
                            <p className="text-gray-300 mb-6">
                                Your trusted local hemp store in St Robert, Missouri. 
                                Serving Pulaski County and the Fort Leonard Wood community 
                                with quality hemp products since 2025.
                            </p>
                            <LocalBusinessInfo variant="minimal" className="text-gray-300" />
                        </div>

                        {/* Social Links */}
                        <div>
                            <h4 className="text-lg font-semibold mb-3">Follow Us</h4>
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
                                        <i className={social.icon} aria-hidden="true" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer Links */}
                    {footerSections.map((section) => (
                        <div key={section.title}>
                            <h4 className="text-lg font-semibold mb-4">{section.title}</h4>
                            <ul className="space-y-2">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <a
                                            href={link.href}
                                            className="text-gray-300 hover:text-green-400 transition-colors text-sm"
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
                        <div className="text-center text-sm text-gray-400 md:text-left">
                            <p>&copy; 2025 Route 66 Hemp. All rights reserved.</p>
                            <p className="mt-1">
                                Licensed hemp retailer in Missouri | 21+ Only
                            </p>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-gray-400">
                            <a href="/src/privacy-policy.html" className="hover:text-green-400">
                                Privacy
                            </a>
                            <a href="/src/terms-of-service.html" className="hover:text-green-400">
                                Terms
                            </a>
                            <span>St Robert, MO 65584</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default FooterNavigation