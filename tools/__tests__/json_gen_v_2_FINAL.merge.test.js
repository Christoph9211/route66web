import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import { JSDOM } from 'jsdom'

const htmlPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../json_gen_v_2_FINAL.html'
)

const setupJsonManager = (options = {}) => {
    const { preloadedLocalStorage } = options
    const html = fs.readFileSync(htmlPath, 'utf8')
    const instrumentedHtml = html.replace(
        '</script>',
        `
window.__jsonGenTestHooks = {
    loadProducts,
    productMergeKey,
    mergeProductRecords,
    parseAvailabilityInput,
    updateAvailabilityHelperText,
    getProducts: () => products,
    getForm: () => form,
    getAvailabilityHelperText: () => availabilityHelper.textContent,
    setSizePricePairs: (pairs) => {
        sizePricePairs = pairs
    },
}
</script>`
    )

    const dom = new JSDOM(instrumentedHtml, {
        runScripts: 'dangerously',
        url: 'http://localhost',
        beforeParse(window) {
            window.alert = vi.fn()
            window.scrollTo = vi.fn()
            if (preloadedLocalStorage) {
                window.localStorage.setItem(
                    'products',
                    JSON.stringify(preloadedLocalStorage)
                )
            }
        },
    })

    return {
        hooks: dom.window.__jsonGenTestHooks,
        window: dom.window,
        close: () => dom.window.close(),
    }
}

describe('json_gen_v_2_FINAL merge', () => {
    it('merges matching products and appends non-matching products', () => {
        const ctx = setupJsonManager()

        try {
            const { hooks } = ctx
            expect(hooks).toBeDefined()

            hooks.loadProducts([
                {
                    name: 'Blue Dream',
                    category: 'Flower',
                    size_options: ['1g'],
                    prices: { '1g': 10 },
                    banner: 'New',
                },
            ])

            const summary = hooks.loadProducts(
                [
                    {
                        name: ' blue dream ',
                        category: 'flower',
                        size_options: ['1g', '3.5g'],
                        prices: { '1g': 12, '3.5g': 30 },
                        thca_percentage: 25,
                    },
                    {
                        name: 'Lemon Haze',
                        category: 'Flower',
                        size_options: ['1g'],
                        prices: { '1g': 11 },
                    },
                ],
                { merge: true }
            )

            expect(summary).toMatchObject({
                merge: true,
                sourceCount: 2,
                validCount: 2,
                addedCount: 1,
                updatedCount: 1,
            })

            const mergedProducts = hooks.getProducts()
            expect(mergedProducts).toHaveLength(2)

            const blueDream = mergedProducts.find(
                (product) =>
                    product.name.trim().toLowerCase() === 'blue dream' &&
                    product.category.trim().toLowerCase() === 'flower'
            )
            expect(blueDream).toBeDefined()
            expect(blueDream.size_options).toEqual(
                expect.arrayContaining(['1g', '3.5g'])
            )
            expect(blueDream.prices['1g']).toBe(12)
            expect(blueDream.prices['3.5g']).toBe(30)
            expect(blueDream.thca_percentage).toBe(25)
            expect(blueDream.banner).toBe('New')
        } finally {
            ctx.close()
        }
    })

    it('does not auto-load stale products from localStorage on init', () => {
        const ctx = setupJsonManager({
            preloadedLocalStorage: [
                {
                    name: 'Stale Product',
                    category: 'Flower',
                    size_options: ['1g'],
                    prices: { '1g': 10 },
                },
            ],
        })

        try {
            expect(ctx.hooks.getProducts()).toHaveLength(0)
        } finally {
            ctx.close()
        }
    })

    it('shows category-aware availability guidance and rejects non-object JSON', () => {
        const ctx = setupJsonManager()

        try {
            const { hooks, window } = ctx
            const form = hooks.getForm()
            const categoryField = form.querySelector('#category')

            expect(hooks.getAvailabilityHelperText()).toContain(
                'Usually leave this blank'
            )

            categoryField.value = 'Vapes & Carts'
            categoryField.dispatchEvent(new window.Event('change'))
            expect(hooks.getAvailabilityHelperText()).toContain(
                'Optional for this category'
            )

            form.querySelector('#name').value = 'Cart Test'
            form.querySelector('#availability').value = '[]'
            hooks.setSizePricePairs([{ size: '1g', price: 25 }])
            form.dispatchEvent(
                new window.Event('submit', {
                    bubbles: true,
                    cancelable: true,
                })
            )

            expect(window.alert).toHaveBeenCalledWith(
                'Availability must be a JSON object, e.g. {"Super Boof": true}'
            )
            expect(hooks.getProducts()).toHaveLength(0)
        } finally {
            ctx.close()
        }
    })

    it('preserves unknown fields when editing an existing product', () => {
        const ctx = setupJsonManager()

        try {
            const { hooks, window } = ctx
            const form = hooks.getForm()
            const categoryField = form.querySelector('#category')

            hooks.loadProducts([
                {
                    name: 'Blue Dream',
                    category: 'Flower',
                    size_options: ['1g'],
                    prices: { '1g': 10 },
                    banner: 'New',
                    legacy_id: 'abc-123',
                    upstream_meta: { source: 'import' },
                },
            ])

            window.document
                .querySelector('button[data-action="edit"][data-idx="0"]')
                .click()
            hooks.setSizePricePairs([{ size: '3.5g', price: 30 }])
            form.querySelector('#name').value = 'Blue Dream Reserve'
            categoryField.value = 'Flower'
            form.querySelector('#thca').value = ''
            form.querySelector('#banner').value = ''
            form.querySelector('#availability').value = ''
            form.dispatchEvent(
                new window.Event('submit', {
                    bubbles: true,
                    cancelable: true,
                })
            )

            const [updatedProduct] = hooks.getProducts()
            expect(updatedProduct).toMatchObject({
                name: 'Blue Dream Reserve',
                category: 'Flower',
                size_options: ['3.5g'],
                prices: { '3.5g': 30 },
                legacy_id: 'abc-123',
                upstream_meta: { source: 'import' },
            })
            expect(updatedProduct).not.toHaveProperty('banner')
        } finally {
            ctx.close()
        }
    })

    it('does not copy unknown fields when duplicating a product', () => {
        const ctx = setupJsonManager()

        try {
            const { hooks, window } = ctx
            const form = hooks.getForm()
            const categoryField = form.querySelector('#category')

            hooks.loadProducts([
                {
                    name: 'Blue Dream',
                    category: 'Flower',
                    size_options: ['1g'],
                    prices: { '1g': 10 },
                    banner: 'New',
                    legacy_id: 'abc-123',
                    upstream_meta: { source: 'import' },
                },
            ])

            window.document
                .querySelector('button[data-action="duplicate"][data-idx="0"]')
                .click()
            hooks.setSizePricePairs([{ size: '3.5g', price: 30 }])
            form.querySelector('#name').value = 'Blue Dream Copy'
            categoryField.value = 'Flower'
            form.querySelector('#thca').value = ''
            form.querySelector('#banner').value = ''
            form.querySelector('#availability').value = ''
            form.dispatchEvent(
                new window.Event('submit', {
                    bubbles: true,
                    cancelable: true,
                })
            )

            const products = hooks.getProducts()
            expect(products).toHaveLength(2)

            const duplicatedProduct = products.find(
                (product) => product.name === 'Blue Dream Copy'
            )
            expect(duplicatedProduct).toMatchObject({
                name: 'Blue Dream Copy',
                category: 'Flower',
                size_options: ['3.5g'],
                prices: { '3.5g': 30 },
            })
            expect(duplicatedProduct).not.toHaveProperty('legacy_id')
            expect(duplicatedProduct).not.toHaveProperty('upstream_meta')
        } finally {
            ctx.close()
        }
    })
})
