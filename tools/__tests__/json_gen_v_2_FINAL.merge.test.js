import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { JSDOM } from 'jsdom'

const htmlPath = path.resolve(process.cwd(), 'tools/json_gen_v_2_FINAL.html')

const setupJsonManager = () => {
    const html = fs.readFileSync(htmlPath, 'utf8')
    const instrumentedHtml = html.replace(
        '</script>',
        `
window.__jsonGenTestHooks = {
    loadProducts,
    productMergeKey,
    mergeProductRecords,
    getProducts: () => products,
}
</script>`
    )

    const dom = new JSDOM(instrumentedHtml, {
        runScripts: 'dangerously',
        url: 'http://localhost',
    })

    return {
        hooks: dom.window.__jsonGenTestHooks,
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
})
