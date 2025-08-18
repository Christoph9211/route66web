// SEO utility functions for local business optimization
export const businessInfo = {
    name: 'Route 66 Hemp',
    address: {
        street: '14076 State Hwy Z',
        city: 'St Robert',
        state: 'MO',
        zip: '65584',
        full: '14076 State Hwy Z, St Robert, MO 65584',
    },
    phone: '+1 (573) 677-6418',
    phoneFormatted: '(573) 677-6418',
    phoneLink: 'tel:+15736776418',
    email: 'route66hemp@gmail.com',
    emailLink: 'mailto:route66hemp@gmail.com',
    website: 'https://route66hemp.com',
    coordinates: {
        lat: 37.8349,
        lng: -92.09725,
    },
}


/**
 * Generates a local title for SEO purposes.
 *
 * @param {string} pageTitle - The title of the page.
 * @param {boolean} [includeLocation=true] - Whether to include the location in the title.
 * @return {string} The generated local title.
 */
export const generateLocalTitle = (pageTitle, includeLocation = true) => {
    const location = includeLocation ? ` | St Robert, MO` : ''
    return `${pageTitle} - ${businessInfo.name}${location}`
}


/**
 * Generates a local description for SEO purposes.
 *
 * @param {string} baseDescription - The base description of the page.
 * @param {boolean} [includeLocation=true] - Whether to include the location in the description.
 * @return {string} The generated local description.
 */
export const generateLocalDescription = (
    baseDescription,
    includeLocation = true
) => {
    const location = includeLocation
        ? ` Located in St Robert, Missouri, serving Pulaski County and surrounding areas.`
        : ''
    return `${baseDescription}${location}`
}

/**
 * Generates a list of local keywords for SEO purposes by combining the baseKeywords
 * with a predefined list of local keywords.
 *
 * @param {Array<string>} [baseKeywords=[]] - The base list of keywords for the page.
 * @return {Array<string>} - The generated list of local keywords.
 */
export const generateLocalKeywords = (baseKeywords = []) => {
    const localKeywords = [
        'St Robert MO',
        'St Robert Missouri',
        'Pulaski County',
        'Fort Leonard Wood',
        'Waynesville MO',
        'Central Missouri',
        'Route 66 State Park',
        'Hemp store St Robert',
        'CBD St Robert MO',
        'Cannabis St Robert',
        'Hemp Dispensary Missouri',
        'Hemp Products Pulaski County',
    ]

    return [...baseKeywords, ...localKeywords]
}

export const formatPhoneForDisplay = () => businessInfo.phoneFormatted
export const formatPhoneForTel = () => businessInfo.phoneLink

/**
 * Returns an object representing the business hours for each day of the week.
 *
 * @return {Object} An object with keys for each day of the week and values
 * representing the opening and closing times for that day.
 */
export const getBusinessHours = () => ({
    monday: { open: '11:00', close: '21:00' },
    tuesday: { open: '11:00', close: '21:00' },
    wednesday: { open: '11:00', close: '21:00' },
    thursday: { open: '11:00', close: '21:00' },
    friday: { open: '11:00', close: '22:00' },
    saturday: { open: '11:00', close: '22:00' },
    sunday: { open: '11:00', close: '19:00' },
})

/**
 * Determines if the current time falls within the business hours for the current day of the week.
 *
 * @return {boolean} True if the current time is within the business hours, false otherwise.
 */
export const isCurrentlyOpen = () => {
    const now = new Date()
    const currentDay = now
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toLowerCase()
    const currentTime = now.getHours() * 100 + now.getMinutes()

    const hours = getBusinessHours()
    const todayHours = hours[currentDay]

    if (!todayHours) return false

    const openTime = parseInt(todayHours.open.replace(':', ''))
    const closeTime = parseInt(todayHours.close.replace(':', ''))

    return currentTime >= openTime && currentTime <= closeTime
}


/**
 * Generates a breadcrumb schema object for use in SEO markup.
 *
 * @param {Array} breadcrumbs - An array of objects representing each breadcrumb in the schema.
 * @return {Object} The breadcrumb schema object.
 */
export const generateBreadcrumbSchema = (breadcrumbs) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: crumb.url,
        })),
    }
}


/**
 * Generates a FAQ schema object for use in SEO markup.
 *
 * @param {Array} faqs - An array of objects representing each FAQ in the schema.
 * @return {Object} The FAQ schema object.
 */
export const generateFAQSchema = (faqs) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    }
}


/**
 * Generates a product schema object for use in SEO markup.
 *
 * @param {Object} product - An object representing the product in the schema.
 * @param {string} product.name - The name of the product.
 * @param {string} product.description - The description of the product.
 * @param {string} product.category - The category of the product.
 * @param {number} product.price - The price of the product.
 * @return {Object} The product schema object.
 */
export const generateProductSchema = (product) => {
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        category: product.category,
        brand: {
            '@type': 'Brand',
            name: businessInfo.name,
        },
        offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
            seller: {
                '@type': 'Organization',
                name: businessInfo.name,
            },
        },
    }
}
