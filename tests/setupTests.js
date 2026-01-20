import { expect } from 'vitest'
import { toHaveNoViolations } from 'jest-axe'
import '@testing-library/jest-dom/vitest'

expect.extend(toHaveNoViolations)

if (!window.localStorage || typeof window.localStorage.getItem !== 'function') {
    const store = new Map()
    window.localStorage = {
        getItem(key) {
            return store.has(key) ? store.get(key) : null
        },
        setItem(key, value) {
            store.set(key, String(value))
        },
        removeItem(key) {
            store.delete(key)
        },
        clear() {
            store.clear()
        },
        key(index) {
            return Array.from(store.keys())[index] ?? null
        },
        get length() {
            return store.size
        },
    }
}
