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
            <ResponsiveImage
                src="/assets/images/route-66-hemp-storefront-st-robert"
                alt="Local"
            />
        )

        const sources = container.querySelectorAll('source')
        expect(sources.length).toBe(3)
        expect(screen.getByAltText('Local')).toHaveAttribute(
            'src',
            '/assets/images/route-66-hemp-storefront-st-robert-640w.jpg'
        )
    })

    it('does not render responsive sources when no manifest entry exists', () => {
        const { container } = render(
            <ResponsiveImage src="/assets/images/unknown-local-image" alt="Unknown" />
        )

        const sources = container.querySelectorAll('source')
        expect(sources.length).toBe(0)
    })

    it('uses explicit srcSetWidths overrides when provided', () => {
        const { container } = render(
            <ResponsiveImage
                src="/assets/images/custom-image"
                alt="Override"
                srcSetWidths={[320, 640]}
            />
        )

        const avifSource = container.querySelector('source[type="image/avif"]')
        expect(avifSource).not.toBeNull()
        expect(avifSource).toHaveAttribute(
            'srcset',
            '/assets/images/custom-image-320w.avif 320w, /assets/images/custom-image-640w.avif 640w'
        )
    })

    it('falls back to base image, then placeholder when errors persist', () => {
        render(<ResponsiveImage src="/assets/images/sample" alt="Error" />)

        const img = screen.getByAltText('Error')
        fireEvent.error(img)

        expect(img).toHaveAttribute(
            'src',
            '/assets/images/sample-640w.jpg'
        )

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
