import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import GoogleBusinessIntegration from '../GoogleBusinessIntegration.jsx'

describe('GoogleBusinessIntegration', () => {
    it('renders review cards and CTA links', () => {
        render(<GoogleBusinessIntegration />)

        expect(
            screen.getByRole('heading', { name: /google reviews/i })
        ).toBeInTheDocument()
        expect(screen.getByText(/best place in this area/i)).toBeInTheDocument()
        expect(
            screen.getByRole('link', { name: /open google maps/i })
        ).toHaveAttribute(
            'href',
            'https://www.google.com/maps/search/Route+66+Hemp+St+Robert+MO'
        )
        expect(
            screen.getByRole('link', { name: /write a google review/i })
        ).toHaveAttribute('href', 'https://g.page/r/CVdnXoVBYQSVEAE/review')
    })
})
