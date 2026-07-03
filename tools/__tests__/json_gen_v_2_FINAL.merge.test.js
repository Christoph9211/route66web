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
    validateProducts,
    getFilteredProductEntries,
    getPresetsForCategory,
    addSizePricePair,
    getProducts: () => products,
    getForm: () => form,
    getAvailabilityHelperText: () => availabilityHelper.textContent,
    getSizePricePairs: () => sizePricePairs,
    setSelectedIndexes: (indexes) => {
        selectedProductIndexes = new Set(indexes)
        renderTable()
    },
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
            window.confirm = vi.fn(() => true)
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
    it('rejects merging a draft before the base catalog is loaded', () => {
        const ctx = setupJsonManager()

        try {
            expect(() =>
                ctx.hooks.loadProducts(
                    [
                        {
                            name: 'Flower Preroll',
                            category: 'Other',
                            size_options: ['Gelato #41'],
                            prices: { 'Gelato #41': 5 },
                        },
                    ],
                    { merge: true }
                )
            ).toThrow(
                'Import the current products.json before merging a draft.'
            )
            expect(ctx.hooks.getProducts()).toHaveLength(0)
        } finally {
            ctx.close()
        }
    })

    it.each([
        ['Flower Preroll', 'Other'],
        ['Infused Prerolls', 'Other'],
        ['One Gram Carts', 'Vapes & Carts'],
        ['One Gram Disposable', 'Vapes & Carts'],
        ['Two Gram Vapes', 'Vapes & Carts'],
    ])('appends variants to grouped product %s', (name, category) => {
        const ctx = setupJsonManager()

        try {
            ctx.hooks.loadProducts([
                {
                    name,
                    category,
                    size_options: ['Existing Variant'],
                    prices: { 'Existing Variant': 10 },
                    banner: 'New',
                },
            ])
            ctx.hooks.loadProducts(
                [
                    {
                        name,
                        category,
                        size_options: ['New Variant'],
                        prices: { 'New Variant': 12 },
                    },
                ],
                { merge: true }
            )

            expect(ctx.hooks.getProducts()[0]).toMatchObject({
                size_options: ['Existing Variant', 'New Variant'],
                prices: {
                    'Existing Variant': 10,
                    'New Variant': 12,
                },
                banner: 'New',
            })
        } finally {
            ctx.close()
        }
    })

    it('deduplicates grouped variants case-insensitively and updates the price', () => {
        const ctx = setupJsonManager()

        try {
            ctx.hooks.loadProducts([
                {
                    name: 'Flower Preroll',
                    category: 'Other',
                    size_options: ['Gelato #41'],
                    prices: { 'Gelato #41': 5 },
                },
            ])
            ctx.hooks.loadProducts(
                [
                    {
                        name: 'Flower Preroll',
                        category: 'Other',
                        size_options: ['gelato #41'],
                        prices: { 'gelato #41': 6 },
                    },
                ],
                { merge: true }
            )

            expect(ctx.hooks.getProducts()[0].size_options).toEqual([
                'Gelato #41',
            ])
            expect(ctx.hooks.getProducts()[0].prices).toEqual({
                'Gelato #41': 6,
            })
        } finally {
            ctx.close()
        }
    })

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

    it('validates missing prices and duplicate product/category keys', () => {
        const ctx = setupJsonManager()

        try {
            const { hooks } = ctx
            hooks.loadProducts([
                {
                    name: 'Blue Dream',
                    category: 'Flower',
                    size_options: ['1g'],
                    prices: {},
                },
                {
                    name: ' blue dream ',
                    category: 'flower',
                    size_options: ['1g'],
                    prices: { '1g': 10 },
                },
            ])

            const issues = hooks.validateProducts(hooks.getProducts())
            expect(issues).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        severity: 'error',
                        message: expect.stringContaining('needs a valid price'),
                    }),
                    expect.objectContaining({
                        severity: 'warning',
                        message: expect.stringContaining(
                            'Duplicate product/category'
                        ),
                    }),
                ])
            )
        } finally {
            ctx.close()
        }
    })

    it('filters by search text, category, banner, missing THCa, and price issues', () => {
        const ctx = setupJsonManager()

        try {
            const { hooks, window } = ctx
            hooks.loadProducts([
                {
                    name: 'Blue Dream',
                    category: 'Flower',
                    size_options: ['1g'],
                    prices: { '1g': 10 },
                    banner: 'New',
                    thca_percentage: 25,
                },
                {
                    name: 'Lemon Cart',
                    category: 'Vapes & Carts',
                    size_options: ['Super Lemon'],
                    prices: {},
                },
            ])

            const search = window.document.querySelector('#search-input')
            const category = window.document.querySelector('#filter-category')
            const banner = window.document.querySelector('#filter-banner')
            const missingThca = window.document.querySelector(
                '#filter-missing-thca'
            )
            const missingPrices = window.document.querySelector(
                '#filter-missing-prices'
            )

            search.value = 'lemon'
            expect(hooks.getFilteredProductEntries()).toHaveLength(1)
            expect(hooks.getFilteredProductEntries()[0].product.name).toBe(
                'Lemon Cart'
            )

            search.value = ''
            category.value = 'Flower'
            expect(hooks.getFilteredProductEntries()[0].product.name).toBe(
                'Blue Dream'
            )

            category.value = ''
            banner.value = '__none'
            expect(hooks.getFilteredProductEntries()[0].product.name).toBe(
                'Lemon Cart'
            )

            banner.value = ''
            missingThca.checked = true
            expect(hooks.getFilteredProductEntries()[0].product.name).toBe(
                'Lemon Cart'
            )

            missingThca.checked = false
            missingPrices.checked = true
            expect(hooks.getFilteredProductEntries()[0].product.name).toBe(
                'Lemon Cart'
            )
        } finally {
            ctx.close()
        }
    })

    it('adds category preset size and price rows', () => {
        const ctx = setupJsonManager()

        try {
            const { hooks } = ctx
            const flowerPresets = hooks.getPresetsForCategory('Flower')
            expect(flowerPresets).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ size: '1/8 oz', price: 25 }),
                    expect.objectContaining({ size: '1/4 oz', price: 50 }),
                ])
            )

            const result = hooks.addSizePricePair(
                flowerPresets[0].size,
                flowerPresets[0].price
            )
            expect(result).toEqual({ ok: true })
            expect(hooks.getSizePricePairs()).toEqual([
                {
                    size: flowerPresets[0].size,
                    price: flowerPresets[0].price,
                },
            ])
        } finally {
            ctx.close()
        }
    })

    it('bulk updates banners only for selected products', () => {
        const ctx = setupJsonManager()

        try {
            const { hooks, window } = ctx
            hooks.loadProducts([
                {
                    name: 'Blue Dream',
                    category: 'Flower',
                    size_options: ['1g'],
                    prices: { '1g': 10 },
                },
                {
                    name: 'Lemon Haze',
                    category: 'Flower',
                    size_options: ['1g'],
                    prices: { '1g': 11 },
                },
            ])
            hooks.setSelectedIndexes([0])

            const bulkBanner = window.document.querySelector('#bulk-banner')
            bulkBanner.value = 'Out of Stock'
            bulkBanner.dispatchEvent(new window.Event('change'))

            expect(hooks.getProducts()[0].banner).toBe('Out of Stock')
            expect(hooks.getProducts()[1]).not.toHaveProperty('banner')
        } finally {
            ctx.close()
        }
    })

    it('escapes imported product text when rendering the table', () => {
        const ctx = setupJsonManager()

        try {
            const { hooks, window } = ctx
            hooks.loadProducts([
                {
                    name: '<img src=x onerror=alert(1)>',
                    category: 'Flower',
                    size_options: ['1g<script>bad()</script>'],
                    prices: { '1g<script>bad()</script>': 10 },
                    banner: '<b>New</b>',
                },
            ])

            const tableHtml =
                window.document.querySelector('#products-table tbody')
                    .innerHTML
            expect(tableHtml).toContain('&lt;img')
            expect(tableHtml).toContain('&lt;script&gt;')
            expect(tableHtml).toContain('&lt;b&gt;New&lt;/b&gt;')
            expect(
                window.document.querySelector('#products-table tbody img')
            ).toBeNull()
            expect(
                window.document.querySelector('#products-table tbody script')
            ).toBeNull()
        } finally {
            ctx.close()
        }
    })
})
