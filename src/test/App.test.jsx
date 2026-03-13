import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, beforeEach, afterEach, expect, it, vi } from 'vitest'
import App from '../../app.jsx'

const sampleProducts = [
    {
        name: 'Sample Flower',
        category: 'Flower',
        size_options: ['1/8 oz'],
        prices: { '1/8 oz': 20 },
        image: '/assets/images/route-66-hemp-flower-placeholder',
        description: 'Fresh flower',
        rating: 5,
    },
    {
        name: 'Sample Edible',
        category: 'Edibles',
        size_options: ['2 count'],
        prices: { '2 count': 8 },
        image: '/assets/images/route-66-hemp-edibles-placeholder',
        description: 'Live resin gummies',
        rating: 5,
    },
]

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

function getStructuredDataEntries(container) {
    return Array.from(
        container.querySelectorAll('script[type="application/ld+json"]')
    ).map((node) => JSON.parse(node.innerHTML))
}

describe('App product catalog loading', () => {
    beforeEach(() => {
        window.localStorage.clear()
        window.localStorage.setItem('isAdult', 'true')
        window.history.replaceState(null, '', '/')
        globalThis.fetch = vi.fn()
    })

    afterEach(() => {
        vi.restoreAllMocks()
        window.history.replaceState(null, '', '/')
    })

    it('does not fetch products or render listing schema on initial load', async () => {
        const { container } = render(<App />)

        await waitFor(() => {
            expect(
                container.querySelectorAll('script[type="application/ld+json"]').length
            ).toBeGreaterThanOrEqual(3)
        })

        const scripts = getStructuredDataEntries(container)

        expect(globalThis.fetch).not.toHaveBeenCalled()
        expect(scripts.some((entry) => entry['@type'] === 'ItemList')).toBe(false)
        expect(
            screen.getByRole('button', { name: 'Load Product Menu' })
        ).toBeInTheDocument()
    })

    it('renders the local-page links after the location content section', async () => {
        render(<App />)

        const localPagesHeading = await screen.findByRole('heading', {
            name: 'Explore Local Dispensary Pages',
        })
        const locationHeading = screen.getByRole('heading', {
            name: 'Serving St Robert and Surrounding Communities',
        })
        const reviewsHeading = screen.getByRole('heading', {
            name: 'Google Reviews',
        })

        expect(
            screen.queryByRole('heading', {
                name: 'Choose a Local Dispensary Page',
            })
        ).not.toBeInTheDocument()

        const localPagesSection = localPagesHeading.closest('section')
        expect(localPagesSection).not.toBeNull()
        expect(
            locationHeading.compareDocumentPosition(localPagesSection) &
                Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy()
        expect(
            localPagesSection.compareDocumentPosition(reviewsHeading) &
                Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy()

        const scopedQueries = within(localPagesSection)
        expect(
            scopedQueries.getByRole('link', {
                name: 'Dispensary in St Robert, MO',
            })
        ).toBeInTheDocument()
        expect(
            scopedQueries.getByRole('link', {
                name: 'Dispensary Near Fort Leonard Wood',
            })
        ).toBeInTheDocument()
        expect(
            scopedQueries.getByRole('link', {
                name: 'Route 66 Dispensary St Robert, MO',
            })
        ).toBeInTheDocument()
    })

    it('loads the lazy product catalog after the CTA is clicked', async () => {
        const user = userEvent.setup()
        globalThis.fetch.mockResolvedValue(createJsonResponse(sampleProducts))

        const { container } = render(<App />)
        await user.click(screen.getByRole('button', { name: 'Load Product Menu' }))

        expect(await screen.findByText('Sample Flower')).toBeInTheDocument()
        expect(globalThis.fetch).toHaveBeenCalledTimes(1)

        await waitFor(() => {
            const scripts = getStructuredDataEntries(container)
            const listingSchema = scripts.find((entry) => entry['@type'] === 'ItemList')

            expect(listingSchema).toBeDefined()
            expect(listingSchema.itemListElement).toHaveLength(sampleProducts.length)
            expect(listingSchema.itemListElement[0].name).toBe('Sample Flower')
        })
    })

    it('auto-loads the product catalog when the page opens on #products', async () => {
        window.history.replaceState(null, '', '/#products')
        globalThis.fetch.mockResolvedValue(createJsonResponse(sampleProducts))

        const { container } = render(<App />)

        expect(await screen.findByText('Sample Flower')).toBeInTheDocument()
        expect(globalThis.fetch).toHaveBeenCalledTimes(1)

        await waitFor(() => {
            const listingSchema = getStructuredDataEntries(container).find(
                (entry) => entry['@type'] === 'ItemList'
            )

            expect(listingSchema).toBeDefined()
            expect(listingSchema.itemListElement[1].name).toBe('Sample Edible')
        })
    })

    it('renders listing schema after retrying a failed product load', async () => {
        const user = userEvent.setup()
        globalThis.fetch = vi
            .fn()
            .mockRejectedValueOnce(new Error('network down'))
            .mockResolvedValueOnce(createJsonResponse(sampleProducts))

        const { container } = render(<App />)

        await user.click(screen.getByRole('button', { name: 'Load Product Menu' }))

        expect(
            await screen.findByRole('heading', {
                name: "We couldn't load today's product menu",
            })
        ).toBeInTheDocument()
        expect(
            getStructuredDataEntries(container).some(
                (entry) => entry['@type'] === 'ItemList'
            )
        ).toBe(false)

        await user.click(screen.getByRole('button', { name: 'Try again' }))

        expect(await screen.findByText('Sample Flower')).toBeInTheDocument()

        await waitFor(() => {
            const listingSchema = getStructuredDataEntries(container).find(
                (entry) => entry['@type'] === 'ItemList'
            )

            expect(listingSchema).toBeDefined()
            expect(listingSchema.itemListElement[0].name).toBe('Sample Flower')
        })
        expect(globalThis.fetch).toHaveBeenCalledTimes(2)
    })
})
