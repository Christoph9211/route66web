import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LocationContent from '../LocationContent.jsx'

describe('LocationContent', () => {
    it('renders key headings and nearby areas', () => {
        render(<LocationContent />)

        expect(
            screen.getByRole('heading', { name: /serving st robert/i })
        ).toBeInTheDocument()
        expect(screen.getAllByText(/fort leonard wood/i).length).toBeGreaterThan(0)
        expect(screen.getByText(/route 66 state park/i)).toBeInTheDocument()
    })
})
