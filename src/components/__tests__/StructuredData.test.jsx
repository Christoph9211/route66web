import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import StructuredData from '../StructuredData.jsx'

describe('StructuredData', () => {
    it('renders core business schema scripts', () => {
        const { container } = render(<StructuredData />)
        const scripts = container.querySelectorAll('script[type="application/ld+json"]')

        expect(scripts.length).toBeGreaterThanOrEqual(3)

        const businessSchema = JSON.parse(scripts[0].innerHTML)
        expect(businessSchema['@type']).toBe('Store')
    })

    it('renders listing schema when products are provided', () => {
        const { container } = render(
            <StructuredData
                products={[{ name: 'Sample', url: 'https://example.com/sample' }]}
            />
        )

        const scripts = container.querySelectorAll('script[type="application/ld+json"]')
        const listingSchema = JSON.parse(scripts[3].innerHTML)
        expect(listingSchema['@type']).toBe('ItemList')
        expect(listingSchema.itemListElement[0].name).toBe('Sample')
    })

    it('renders product schema in detail mode', () => {
        const { container } = render(
            <StructuredData
                pageMode="detail"
                product={{
                    name: 'Detail Product',
                    price: 12.5,
                    ratingValue: 5,
                    reviewCount: 2,
                    url: 'https://example.com/detail',
                }}
            />
        )

        const scripts = container.querySelectorAll('script[type="application/ld+json"]')
        const productSchema = JSON.parse(scripts[3].innerHTML)
        expect(productSchema['@type']).toBe('Product')
        expect(productSchema.offers.price).toBe('12.50')
    })
})
