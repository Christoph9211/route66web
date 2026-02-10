import { describe, it, expect } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import ResponsiveImage from '../ResponsiveImage.jsx'

describe('ResponsiveImage', () => {
    it('renders external images directly', () => {
        render(
            <ResponsiveImage
                src="https://example.com/image.jpg"
                alt="External"
                width={100}
                height={100}
            />
        )

        const img = screen.getByAltText('External')
        expect(img.tagName).toBe('IMG')
        expect(img).toHaveAttribute('src', 'https://example.com/image.jpg')
    })

    it('renders responsive sources for local images', () => {
        const { container } = render(
            <ResponsiveImage src="/assets/images/sample" alt="Local" />
        )

        const sources = container.querySelectorAll('source')
        expect(sources.length).toBe(3)
        expect(screen.getByAltText('Local')).toHaveAttribute(
            'src',
            '/assets/images/sample-640w.jpg'
        )
    })

    it('falls back when an error occurs', () => {
        render(<ResponsiveImage src="/assets/images/sample" alt="Error" />)

        const img = screen.getByAltText('Error')
        fireEvent.error(img)

        expect(img).toHaveAttribute(
            'src',
            '/assets/images/route-66-hemp-product-placeholder-640w.webp'
        )
    })

    it('marks images as loaded after load event', () => {
        render(<ResponsiveImage src="/assets/images/sample" alt="Load" />)

        const img = screen.getByAltText('Load')
        expect(img.className).toMatch(/loading/)

        fireEvent.load(img)

        expect(img.className).toMatch(/loaded/)
    })
})
