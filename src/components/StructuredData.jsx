// Structured Data Component for Local Business SEO

function slugify(str = '') {
    return String(str)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

function ProductSchema({ product, mode = 'listing' }) {
    const canOffer = Number.isFinite(product?.price)
    const hasAgg = product?.ratingValue && product?.reviewCount
    const hasReview = Array.isArray(product?.reviews) && product.reviews.length > 0

    if (mode !== 'detail' || (!canOffer && !hasAgg && !hasReview)) {
        return null
    }

    const data = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        url:
          product.url ||
          `https://www.route66hemp.com/products/${slugify(product.category)}/${slugify(product.name)}`
        ,
    }

    if (canOffer) {
        data.offers = {
            '@type': 'Offer',
            price: product.price.toFixed(2),
            priceCurrency: product.currency || 'USD',
            availability: product.availability || 'https://schema.org/InStock',
            url: data.url,
            seller: { '@type': 'Organization', name: 'Route 66 Hemp' },
        }
    }

    if (hasAgg) {
        data.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: String(product.ratingValue),
            reviewCount: String(product.reviewCount),
        }
    }

    if (hasReview) {
        data.review = product.reviews
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    )
}

function ListingSchema({ items = [] }) {
    const itemList = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: items.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url:
              p.url ||
              `https://www.route66hemp.com/products/${slugify(p.category)}/${slugify(p.name)}`,
            name: p.name,
        })),
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
        />
    )
}

function StructuredData({ products = [], pageMode = 'listing', product = null }) {
    const businessData = {
        '@context': 'https://schema.org',
        '@type': 'Store',
        name: 'Route 66 Hemp',
        description:
            'Premium hemp products for your wellness journey. Quality you can trust.',
        url: 'https://www.route66hemp.com',
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
        image: 'https://www.route66hemp.com/og-image.jpg',
        logo: 'https://www.route66hemp.com/favicon-32x32.png',
        sameAs: [
            'https://www.facebook.com/profile.php?id=61580782509105',
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
    }

    const breadcrumbData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://www.route66hemp.com',
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Products',
                item: 'https://www.route66hemp.com',
            },
        ],
    }

    const organizationData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Route 66 Hemp',
        url: 'https://www.route66hemp.com',
        logo: 'https://www.route66hemp.com/favicon-32x32.png',
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
            {pageMode === 'listing' && Array.isArray(products) && products.length > 0 ? (
                <ListingSchema items={products} />
            ) : null}
            {pageMode === 'detail' && product ? (
                <ProductSchema product={product} mode="detail" />
            ) : null}
        </>
    )
}

export default StructuredData
