import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorBoundary from '../ErrorBoundary.jsx'

function Thrower({ shouldThrow }) {
    if (shouldThrow) {
        throw new Error('Boom')
    }
    return <div>Safe content</div>
}

describe('ErrorBoundary', () => {
    it('renders fallback UI when a child throws', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

        render(
            <ErrorBoundary>
                <Thrower shouldThrow />
            </ErrorBoundary>
        )

        expect(
            screen.getByRole('heading', { name: /something went wrong/i })
        ).toBeInTheDocument()

        spy.mockRestore()
    })

    it('retries rendering children after clicking Try Again', async () => {
        const user = userEvent.setup()
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

        const { rerender } = render(
            <ErrorBoundary>
                <Thrower shouldThrow />
            </ErrorBoundary>
        )

        rerender(
            <ErrorBoundary>
                <Thrower shouldThrow={false} />
            </ErrorBoundary>
        )

        await user.click(screen.getByRole('button', { name: /try again/i }))

        expect(screen.getByText(/safe content/i)).toBeInTheDocument()

        spy.mockRestore()
    })

    it('shows a reload button in the fallback UI', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

        render(
            <ErrorBoundary>
                <Thrower shouldThrow />
            </ErrorBoundary>
        )

        expect(
            screen.getByRole('button', { name: /reload page/i })
        ).toBeInTheDocument()

        spy.mockRestore()
    })
})
