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
})
