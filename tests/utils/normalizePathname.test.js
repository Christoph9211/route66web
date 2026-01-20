import { describe, expect, it } from 'vitest'
import { normalizePathname } from '../../src/utils/normalizePathname.js'

describe('normalizePathname', () => {
    it('strips leading and trailing slashes', () => {
        expect(normalizePathname('/products/')).toBe('products')
        expect(normalizePathname('/about')).toBe('about')
    })

    it('returns empty for root or blank values', () => {
        expect(normalizePathname('/')).toBe('')
        expect(normalizePathname('')).toBe('')
        expect(normalizePathname('   ')).toBe('')
        expect(normalizePathname(null)).toBe('')
    })

    it('handles repeated slashes', () => {
        expect(normalizePathname('///faq///')).toBe('faq')
    })
})
