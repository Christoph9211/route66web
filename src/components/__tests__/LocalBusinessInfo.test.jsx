import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LocalBusinessInfo from '../LocalBusinessInfo.jsx'
import { businessInfo } from '../../utils/businessInfo.js'

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

        expect(
            screen.getByText(
                `${businessInfo.name} • ${businessInfo.address.city}, ${businessInfo.address.state} •`
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
