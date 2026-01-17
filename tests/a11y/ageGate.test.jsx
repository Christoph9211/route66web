import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { afterEach, describe, expect, it } from 'vitest'
import AgeGate from '../../src/components/AgeGate.jsx'

describe('AgeGate accessibility', () => {
    afterEach(() => {
        window.localStorage.clear()
    })

    it('has no basic accessibility violations when visible', async () => {
        window.localStorage.removeItem('isAdult')
        const { container, findByText } = render(<AgeGate />)

        await findByText(/are you 21 or older/i)
        const results = await axe(container)
        expect(results).toHaveNoViolations()
    })
})
