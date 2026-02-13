import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AgeGate from '../AgeGate.jsx'

describe('AgeGate', () => {
    beforeEach(() => {
        window.localStorage.clear()
        delete window.confirmAge21
    })

    it('renders the age gate when no confirmation is stored', async () => {
        render(<AgeGate />)

        expect(
            await screen.findByRole('heading', { name: /are you 21 or older/i })
        ).toBeInTheDocument()
        expect(screen.getByText(/legal age to enter/i)).toBeInTheDocument()
    })

    it('hides the gate when confirmation is stored', () => {
        window.localStorage.setItem('isAdult', 'true')

        const { container } = render(<AgeGate />)
        expect(container).toBeEmptyDOMElement()
    })

    it('calls the global confirm handler and hides after confirming', async () => {
        const user = userEvent.setup()
        window.confirmAge21 = vi.fn()

        render(<AgeGate />)

        await user.click(screen.getByRole('button', { name: /i am 21\+/i }))

        expect(window.confirmAge21).toHaveBeenCalledTimes(1)
        expect(
            screen.queryByRole('heading', { name: /are you 21 or older/i })
        ).not.toBeInTheDocument()
    })

    it('keeps keyboard focus within the dialog while visible', async () => {
        const user = userEvent.setup()
        render(
            <>
                <AgeGate />
                <a href="#outside">Outside link</a>
            </>
        )

        const confirmButton = await screen.findByRole('button', {
            name: /i am 21\+/i,
        })
        const leaveLink = screen.getByRole('link', { name: /no, take me back/i })

        await waitFor(() => expect(confirmButton).toHaveFocus())
        await user.tab()
        expect(leaveLink).toHaveFocus()
        await user.tab()
        expect(confirmButton).toHaveFocus()
    })
})
