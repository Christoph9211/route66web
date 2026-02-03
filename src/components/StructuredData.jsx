// Structured Data Component for Local Business SEO

import { businessInfo } from '../utils/businessInfo'
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://www.route66hemp.com'

function ProductSchema({ product, mode = 'listing' }) {
    const canOffer = Number.isFinite(product?.price)
    const hasAgg = product?.ratingValue && product?.reviewCount
    const hasReview = Array.isArray(product?.reviews) && product.reviews.length > 0

    if (mode !== 'detail' || (!canOffer && !hasAgg && !hasReview)) {
        return null
    }

    const productName = product?.name || 'Route 66 Hemp Product'
    const productCategory = product?.category || 'Hemp Product'

    const data = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: productName,
    }

    if (product?.url) {
        data.url = product.url
    }

    if (product?.image) {
        const imageUrl = product.image.startsWith('http')
            ? product.image
            : `${SITE_URL}${product.image}`

        data.image = {
            '@type': 'ImageObject',
            url: imageUrl,
            width: '800',
            height: '800',
            caption: `${productName} - ${productCategory} available at Route 66 Hemp`,
            contentLocation: {
                '@type': 'Place',
                name: 'Route 66 Hemp',
                address: {
                    '@type': 'PostalAddress',
                    streetAddress: businessInfo.address.street,
                    addressLocality: businessInfo.address.city,
                    addressRegion: businessInfo.address.state,
                    postalCode: businessInfo.address.zip,
                    addressCountry: 'US',
                },
            },
        }
    }

    data.brand = {
        '@type': 'Brand',
        name: 'Route 66 Hemp',
        logo: `${SITE_URL}/route-66-hemp-logo-512x512.png`,
    }

    if (canOffer) {
        data.offers = {
            '@type': 'Offer',
            price: product.price.toFixed(2),
            priceCurrency: product.currency || 'USD',
            availability: product.availability || 'https://schema.org/InStock',
            url: data.url,
            seller: {
                '@type': 'LocalBusiness',
                name: 'Route 66 Hemp',
                image: `${SITE_URL}/assets/images/route-66-hemp-storefront-st-robert-1280w.webp`,
                address: {
                    '@type': 'PostalAddress',
                    streetAddress: businessInfo.address.street,
                    addressLocality: businessInfo.address.city,
                    addressRegion: businessInfo.address.state,
                    postalCode: businessInfo.address.zip,
                    addressCountry: 'US',
                },
            },
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
        itemListElement: items.map((p, i) => {
            const listItem = {
                '@type': 'ListItem',
                position: i + 1,
                name: p.name,
            }

            if (p?.url) {
                listItem.url = p.url
            }

            return listItem
        }),
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
        name: businessInfo.name,
        description:
            'Premium hemp products for your wellness journey. Quality you can trust.',
        url: businessInfo.website,
        telephone: businessInfo.phone,
        email: businessInfo.email,
        address: {
            '@type': 'PostalAddress',
            streetAddress: businessInfo.address.street,
            addressLocality: businessInfo.address.city,
            addressRegion: businessInfo.address.state,
            postalCode: businessInfo.address.zip,
            addressCountry: 'US',
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: String(businessInfo.coordinates.lat),
            longitude: String(businessInfo.coordinates.lng),
        },
        openingHoursSpecification: [
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
                opens: businessInfo.hours.monday.open,
                closes: businessInfo.hours.monday.close,
            },
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Friday', 'Saturday'],
                opens: businessInfo.hours.friday.open,
                closes: businessInfo.hours.friday.close,
            },
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: 'Sunday',
                opens: businessInfo.hours.sunday.open,
                closes: businessInfo.hours.sunday.close,
            },
        ],
        priceRange: '$',
        currenciesAccepted: 'USD',
        paymentAccepted: 'Cash',
        image: `${SITE_URL}/assets/images/route-66-hemp-og-image.jpg`,
        logo: `${SITE_URL}/route-66-hemp-logo-512x512.png`,
        sameAs: [
            'https://www.facebook.com/route66hemp/',
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
        name: businessInfo.name,
        url: businessInfo.website,
        logo: `${SITE_URL}/route-66-hemp-logo-512x512.png`,
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: businessInfo.phone,
            contactType: 'customer service',
            availableLanguage: 'English',
        },
        address: {
            '@type': 'PostalAddress',
            streetAddress: businessInfo.address.street,
            addressLocality: businessInfo.address.city,
            addressRegion: businessInfo.address.state,
            postalCode: businessInfo.address.zip,
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

