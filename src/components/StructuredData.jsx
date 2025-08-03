// Structured Data Component for Local Business SEO

function StructuredData() {
    const businessData = {
        '@context': 'https://schema.org',
        '@type': 'Store',
        name: 'Route 66 Hemp',
        description:
            'Premium hemp products for your wellness journey. Quality you can trust.',
        url: 'https://route66hemp.com',
        telephone: '+1-573-677-6418',
        email: 'route66hemp@gmail.com',
        address: {
            '@type': 'PostalAddress',
            streetAddress: '14076 State Hwy Z',
            addressLocality: 'St Robert',
            addressRegion: 'MO',
            postalCode: '65584',
            addressCountry: 'US',
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: '37.83490',
            longitude: '-92.09725',
        },
        openingHoursSpecification: [
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
                opens: '11:00',
                closes: '21:00',
            },
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Friday', 'Saturday'],
                opens: '11:00',
                closes: '22:00',
            },
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: 'Sunday',
                opens: '11:00',
                closes: '19:00',
            },
        ],
        priceRange: '$',
        currenciesAccepted: 'USD',
        paymentAccepted: 'Cash, Credit Card',
        image: 'https://route66hemp.com/og-image.jpg',
        logo: 'https://route66hemp.com/favicon-32x32.png',
        sameAs: [
            'https://www.facebook.com/route66hemp',
            'https://www.instagram.com/route66hemp',
            'https://www.twitter.com/route66hemp',
        ],
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.4',
            reviewCount: '8',
        },
        review: [
            {
                '@type': 'Review',
                author: {
                    '@type': 'Person',
                    name: 'Sarah Johnson',
                },
                reviewRating: {
                    '@type': 'Rating',
                    ratingValue: '5',
                },
                reviewBody:
                    'Excellent quality hemp products and knowledgeable staff. Great selection and fair prices.',
            },
        ],
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Hemp Products',
            itemListElement: [
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Product',
                        name: 'CBD Flower',
                        category: 'Hemp Products',
                    },
                },
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Product',
                        name: 'Hemp Concentrates',
                        category: 'Hemp Products',
                    },
                },
                {
                    '@type': 'Offer',
                    itemOffered: {
                        '@type': 'Product',
                        name: 'Vapes & Cartridges',
                        category: 'Hemp Products',
                    },
                },
            ],
        },
    }

    const breadcrumbData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://route66hemp.com',
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Products',
                item: 'https://route66hemp.com#products',
            },
        ],
    }

    const organizationData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Route 66 Hemp',
        url: 'https://route66hemp.com',
        logo: 'https://route66hemp.com/favicon-32x32.png',
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: '+1-573-677-6418',
            contactType: 'customer service',
            availableLanguage: 'English',
        },
        address: {
            '@type': 'PostalAddress',
            streetAddress: '14076 State Hwy Z',
            addressLocality: 'St Robert',
            addressRegion: 'MO',
            postalCode: '65584',
            addressCountry: 'US',
        },
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(businessData),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbData),
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(organizationData),
                }}
            />
        </>
    )
}

export default StructuredData
