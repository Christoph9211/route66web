import '@testing-library/jest-dom'

function createStorageMock() {
    const store = new Map()
    return {
        getItem(key) {
            return store.has(key) ? store.get(key) : null
        },
        setItem(key, value) {
            store.set(String(key), String(value))
        },
        removeItem(key) {
            store.delete(String(key))
        },
        clear() {
            store.clear()
        },
    }
}

if (
    typeof window !== 'undefined' &&
    (!window.localStorage || typeof window.localStorage.clear !== 'function')
) {
    Object.defineProperty(window, 'localStorage', {
        value: createStorageMock(),
        configurable: true,
    })
}

if (
    typeof window !== 'undefined' &&
    (!window.sessionStorage || typeof window.sessionStorage.clear !== 'function')
) {
    Object.defineProperty(window, 'sessionStorage', {
        value: createStorageMock(),
        configurable: true,
    })
}

if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia !== 'function'
) {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: (query) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener() {},
            removeListener() {},
            addEventListener() {},
            removeEventListener() {},
            dispatchEvent() {
                return false
            },
        }),
    })
}

if (
    typeof window !== 'undefined' &&
    typeof window.HTMLElement !== 'undefined' &&
    typeof window.HTMLElement.prototype.scrollIntoView !== 'function'
) {
    window.HTMLElement.prototype.scrollIntoView = function scrollIntoView() {}
}
