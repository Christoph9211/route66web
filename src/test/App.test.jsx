import { render, screen, waitFor } from '@testing-library/react'
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

        const scripts = Array.from(
            container.querySelectorAll('script[type="application/ld+json"]')
        ).map((node) => JSON.parse(node.innerHTML))

        expect(globalThis.fetch).not.toHaveBeenCalled()
        expect(scripts.some((entry) => entry['@type'] === 'ItemList')).toBe(false)
        expect(
            screen.getByRole('button', { name: 'Load Product Menu' })
        ).toBeInTheDocument()
    })

    it('loads the lazy product catalog after the CTA is clicked', async () => {
        const user = userEvent.setup()
        globalThis.fetch.mockResolvedValue(createJsonResponse(sampleProducts))

        render(<App />)
        await user.click(screen.getByRole('button', { name: 'Load Product Menu' }))

        expect(await screen.findByText('Sample Flower')).toBeInTheDocument()
        expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    })

    it('auto-loads the product catalog when the page opens on #products', async () => {
        window.history.replaceState(null, '', '/#products')
        globalThis.fetch.mockResolvedValue(createJsonResponse(sampleProducts))

        render(<App />)

        expect(await screen.findByText('Sample Flower')).toBeInTheDocument()
        expect(globalThis.fetch).toHaveBeenCalledTimes(1)
    })
})
