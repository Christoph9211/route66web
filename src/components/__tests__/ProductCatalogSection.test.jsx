import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, beforeEach, afterEach, expect, it, vi } from 'vitest'
import ProductCatalogSection from '../ProductCatalogSection.jsx'

const flowerProducts = Array.from({ length: 10 }, (_, index) => ({
    name: `Flower ${index + 1}`,
    category: 'Flower',
    size_options: ['1/8 oz'],
    prices: { '1/8 oz': 20 + index },
    image: '/assets/images/route-66-hemp-flower-placeholder',
    description: `Flower option ${index + 1}`,
    rating: 5,
}))

const edibleProducts = Array.from({ length: 10 }, (_, index) => ({
    name: `Edible ${index + 1}`,
    category: 'Edibles',
    size_options: ['2 count'],
    prices: { '2 count': 8 + index },
    image: '/assets/images/route-66-hemp-edibles-placeholder',
    description: `Edible option ${index + 1}`,
    rating: 5,
}))

const makeProduct = ({
    name,
    category = 'Flower',
    banner,
    availability,
    sizeOptions = ['1/8 oz'],
}) => ({
    name,
    category,
    size_options: sizeOptions,
    prices: Object.fromEntries(sizeOptions.map((size) => [size, 20])),
    image: '/assets/images/route-66-hemp-flower-placeholder',
    description: `${name} description`,
    rating: 5,
    ...(banner ? { banner } : {}),
    ...(availability ? { availability } : {}),
})

const productCardNames = (container) =>
    Array.from(container.querySelectorAll('.product-card h3')).map((heading) =>
        heading.textContent.trim()
    )

function createJsonResponse(payload) {
    return {
        ok: true,
        headers: {
            get(name) {
                return name === 'content-type' ? 'application/json' : null
            },
        },
        json: vi.fn().mockResolvedValue(payload),
        text: vi.fn(),
    }
}

function mockMatchMedia(matches) {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches,
        media: query,
        onchange: null,
        addListener() {},
        removeListener() {},
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent() {
            return false
        },
    }))
}

describe('ProductCatalogSection', () => {
    beforeEach(() => {
        globalThis.fetch = vi
            .fn()
            .mockResolvedValue(createJsonResponse([...flowerProducts, ...edibleProducts]))
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('shows 8 products by default on desktop and loads more on demand', async () => {
        const user = userEvent.setup()
        mockMatchMedia(false)
        const { container } = render(<ProductCatalogSection />)

        await waitFor(() => {
            expect(container.querySelectorAll('.product-card')).toHaveLength(8)
        })

        expect(screen.getByText('Showing 8 of 20')).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'Load more products' }))

        await waitFor(() => {
            expect(container.querySelectorAll('.product-card')).toHaveLength(16)
        })
        expect(screen.getByText('Showing 16 of 20')).toBeInTheDocument()
    })

    it('shows 4 products by default on mobile', async () => {
        mockMatchMedia(true)
        const { container } = render(<ProductCatalogSection />)

        await waitFor(() => {
            expect(container.querySelectorAll('.product-card')).toHaveLength(4)
        })

        expect(screen.getByText('Showing 4 of 20')).toBeInTheDocument()
    })

    it('resets pagination when the selected category changes', async () => {
        const user = userEvent.setup()
        mockMatchMedia(false)
        const { container } = render(<ProductCatalogSection />)

        await waitFor(() => {
            expect(container.querySelectorAll('.product-card')).toHaveLength(8)
        })

        await user.click(screen.getByRole('button', { name: 'Load more products' }))

        await waitFor(() => {
            expect(container.querySelectorAll('.product-card')).toHaveLength(16)
        })

        await user.click(screen.getByRole('button', { name: 'Filter by Flower' }))

        await waitFor(() => {
            expect(container.querySelectorAll('.product-card')).toHaveLength(8)
        })

        expect(screen.getByText('Showing 8 of 10')).toBeInTheDocument()
    })

    it('orders in-stock products before capped out-of-stock products', async () => {
        mockMatchMedia(false)
        globalThis.fetch = vi.fn().mockResolvedValue(
            createJsonResponse([
                makeProduct({
                    name: 'Sold Out First',
                    banner: 'Out of Stock',
                }),
                makeProduct({ name: 'Available Flower' }),
                makeProduct({
                    name: 'Sold Out Second',
                    banner: 'Out of Stock',
                }),
            ])
        )

        const { container } = render(<ProductCatalogSection />)

        await waitFor(() => {
            expect(productCardNames(container)).toEqual([
                'Available Flower',
                'Sold Out First',
                'Sold Out Second',
            ])
        })
    })

    it('limits a selected category to 3 out-of-stock products', async () => {
        const user = userEvent.setup()
        mockMatchMedia(false)
        globalThis.fetch = vi.fn().mockResolvedValue(
            createJsonResponse([
                makeProduct({ name: 'Available Flower' }),
                ...Array.from({ length: 5 }, (_, index) =>
                    makeProduct({
                        name: `Sold Out Flower ${index + 1}`,
                        banner: 'Out of Stock',
                    })
                ),
                makeProduct({
                    name: 'Available Edible',
                    category: 'Edibles',
                    sizeOptions: ['2 count'],
                }),
            ])
        )

        const { container } = render(<ProductCatalogSection />)

        await user.click(
            await screen.findByRole('button', { name: 'Filter by Flower' })
        )

        await waitFor(() => {
            expect(productCardNames(container)).toEqual([
                'Available Flower',
                'Sold Out Flower 1',
                'Sold Out Flower 2',
                'Sold Out Flower 3',
            ])
        })
    })

    it('limits all products to 3 out-of-stock products per category', async () => {
        mockMatchMedia(false)
        globalThis.fetch = vi.fn().mockResolvedValue(
            createJsonResponse([
                makeProduct({ name: 'Available Flower' }),
                ...Array.from({ length: 4 }, (_, index) =>
                    makeProduct({
                        name: `Sold Out Flower ${index + 1}`,
                        banner: 'Out of Stock',
                    })
                ),
                ...Array.from({ length: 4 }, (_, index) =>
                    makeProduct({
                        name: `Sold Out Edible ${index + 1}`,
                        category: 'Edibles',
                        sizeOptions: ['2 count'],
                        banner: 'Out of Stock',
                    })
                ),
            ])
        )

        const { container } = render(<ProductCatalogSection />)

        await waitFor(() => {
            expect(productCardNames(container)).toEqual([
                'Available Flower',
                'Sold Out Flower 1',
                'Sold Out Flower 2',
                'Sold Out Flower 3',
                'Sold Out Edible 1',
                'Sold Out Edible 2',
                'Sold Out Edible 3',
            ])
        })
    })

    it('treats mixed availability products as in stock', async () => {
        mockMatchMedia(false)
        globalThis.fetch = vi.fn().mockResolvedValue(
            createJsonResponse([
                makeProduct({
                    name: 'Fully Sold Out',
                    availability: {
                        '1/8 oz': 'Out of Stock',
                        '1/4 oz': 'Out of Stock',
                    },
                    sizeOptions: ['1/8 oz', '1/4 oz'],
                }),
                makeProduct({
                    name: 'Partially Available',
                    availability: { '1/8 oz': 'Out of Stock' },
                    sizeOptions: ['1/8 oz', '1/4 oz'],
                }),
            ])
        )

        const { container } = render(<ProductCatalogSection />)

        await waitFor(() => {
            expect(productCardNames(container)).toEqual([
                'Partially Available',
                'Fully Sold Out',
            ])
        })
    })
})
