import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LocalBusinessInfo from '../LocalBusinessInfo.jsx'
import { businessInfo } from '../../utils/businessInfo.js'

const escapeRegex = (value) =>
    String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

describe('LocalBusinessInfo', () => {
    it('renders minimal variant with core info', () => {
        render(<LocalBusinessInfo variant="minimal" />)

        expect(screen.getByText(businessInfo.name)).toBeInTheDocument()
        expect(screen.getByText(businessInfo.address.full)).toBeInTheDocument()
        expect(screen.getByRole('link', { name: businessInfo.phone })).toHaveAttribute(
            'href',
            businessInfo.phoneLink
        )
    })

    it('renders inline variant with city and phone', () => {
        render(<LocalBusinessInfo variant="inline" />)

        const inlinePattern = new RegExp(
            `${escapeRegex(businessInfo.name)}\\s*[-•]\\s*${escapeRegex(
                businessInfo.address.city
            )},\\s*${escapeRegex(businessInfo.address.state)}`
        )

        expect(
            screen.getByText((_, element) =>
                element?.tagName === 'SPAN' &&
                inlinePattern.test(element.textContent ?? '')
            )
        ).toBeInTheDocument()
        expect(screen.getByRole('link', { name: businessInfo.phone })).toHaveAttribute(
            'href',
            businessInfo.phoneLink
        )
    })

    it('renders full variant with hours', () => {
        render(<LocalBusinessInfo />)

        expect(
            screen.getByRole('heading', { name: /store information/i })
        ).toBeInTheDocument()
        Object.entries(businessInfo.hoursDisplay).forEach(([days, hours]) => {
            expect(screen.getByText(`${days}: ${hours}`)).toBeInTheDocument()
        })
    })
})
