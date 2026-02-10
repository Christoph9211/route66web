import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LocalSEOFAQ from '../LocalSEOFAQ.jsx'

describe('LocalSEOFAQ', () => {
    it('renders questions and toggles an answer', async () => {
        const user = userEvent.setup()
        render(<LocalSEOFAQ />)

        const button = screen.getByRole('button', {
            name: /where is route 66 hemp located/i,
        })

        expect(button).toHaveAttribute('aria-expanded', 'false')

        await user.click(button)

        expect(button).toHaveAttribute('aria-expanded', 'true')
        expect(screen.getByRole('region')).toHaveTextContent(/14076 state hwy z/i)
    })
})
