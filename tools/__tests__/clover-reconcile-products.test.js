import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import {
    buildNextProducts,
    normalizeCloverItem,
    normalizeCloverRows,
    normalizeSize,
    readXlsxSheet,
    reconcileProducts,
    rowsToObjects,
} from '../clover-reconcile-products.js'

const baseRow = {
    'Clover ID': 'ABC123',
    Name: '',
    Price: 20,
    'Product Code': '',
    SKU: '',
    Quantity: '',
    'Hidden?': 'No',
    'Non-revenue item?': 'No',
    Categories: 'Regular Flower',
}

const cloverHeaders = [
    'Clover ID',
    'Name',
    'Alternate Name',
    'Description',
    'Price',
    'Price Type',
    'Price Unit',
    'Cost',
    'Product Code',
    'SKU',
    'Quantity',
    'Hidden?',
    'Default tax rates?',
    'Non-revenue item?',
    'Printer Labels',
    'Modifier Groups',
    'Categories',
    'Tax Rates',
    'Variant Attribute',
    'Variant Option',
]

const xmlEscape = (value) =>
    String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')

const columnName = (index) => {
    let name = ''
    let current = index + 1
    while (current > 0) {
        const remainder = (current - 1) % 26
        name = String.fromCharCode(65 + remainder) + name
        current = Math.floor((current - 1) / 26)
    }
    return name
}

const worksheetXml = (rows) => `<?xml version="1.0" encoding="UTF-8"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
${rows
    .map(
        (row, rowIndex) =>
            `    <row r="${rowIndex + 1}">${row
                .map((value, colIndex) => {
                    const ref = `${columnName(colIndex)}${rowIndex + 1}`
                    if (typeof value === 'number') {
                        return `<c r="${ref}"><v>${value}</v></c>`
                    }
                    return `<c r="${ref}" t="inlineStr"><is><t>${xmlEscape(value)}</t></is></c>`
                })
                .join('')}</row>`
    )
    .join('\n')}
  </sheetData>
</worksheet>`

const cloverRow = (overrides) =>
    cloverHeaders.map((header) => {
        const defaults = {
            Price: 20,
            'Price Type': 'Fixed',
            Quantity: '',
            'Hidden?': 'No',
            'Default tax rates?': 'Yes',
            'Non-revenue item?': 'No',
            Categories: 'Regular Flower',
        }
        return overrides[header] ?? defaults[header] ?? ''
    })

const zipFixture = (entries) => {
    const localParts = []
    const centralParts = []
    let offset = 0

    for (const [name, content] of entries) {
        const nameBuffer = Buffer.from(name)
        const dataBuffer = Buffer.from(content)
        const local = Buffer.alloc(30)
        local.writeUInt32LE(0x04034b50, 0)
        local.writeUInt16LE(20, 4)
        local.writeUInt32LE(dataBuffer.length, 18)
        local.writeUInt32LE(dataBuffer.length, 22)
        local.writeUInt16LE(nameBuffer.length, 26)
        localParts.push(local, nameBuffer, dataBuffer)

        const central = Buffer.alloc(46)
        central.writeUInt32LE(0x02014b50, 0)
        central.writeUInt16LE(20, 4)
        central.writeUInt16LE(20, 6)
        central.writeUInt32LE(dataBuffer.length, 20)
        central.writeUInt32LE(dataBuffer.length, 24)
        central.writeUInt16LE(nameBuffer.length, 28)
        central.writeUInt32LE(offset, 42)
        centralParts.push(central, nameBuffer)
        offset += local.length + nameBuffer.length + dataBuffer.length
    }

    const centralDirectory = Buffer.concat(centralParts)
    const eocd = Buffer.alloc(22)
    eocd.writeUInt32LE(0x06054b50, 0)
    eocd.writeUInt16LE(entries.length, 8)
    eocd.writeUInt16LE(entries.length, 10)
    eocd.writeUInt32LE(centralDirectory.length, 12)
    eocd.writeUInt32LE(offset, 16)

    return Buffer.concat([...localParts, centralDirectory, eocd])
}

const writeCloverFixture = () => {
    const rows = [
        cloverHeaders,
        cloverRow({
            'Clover ID': 'ONE',
            Name: 'Blackberry Superboof (1/8)',
            Price: 20,
            SKU: 'FLW-REG-BLACKBERRYSUPERBOOF-3.5G',
        }),
        cloverRow({
            'Clover ID': 'TWO',
            Name: 'Blackberry Superboof (1/4)',
            Price: 40,
            SKU: 'FLW-REG-BLACKBERRYSUPERBOOF-7G',
        }),
        cloverRow({
            'Clover ID': 'THREE',
            Name: 'Clover Only (1/8)',
            Price: 20,
        }),
    ]
    const filePath = path.join(
        fs.mkdtempSync(path.join(os.tmpdir(), 'clover-fixture-')),
        'inventory.xlsx'
    )
    fs.writeFileSync(
        filePath,
        zipFixture([
            [
                'xl/workbook.xml',
                `<?xml version="1.0" encoding="UTF-8"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Items" sheetId="1" r:id="rId1"/></sheets>
</workbook>`,
            ],
            [
                'xl/_rels/workbook.xml.rels',
                `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`,
            ],
            ['xl/worksheets/sheet1.xml', worksheetXml(rows)],
        ])
    )
    return filePath
}

describe('Clover product reconciliation', () => {
    it('normalizes Clover size labels used by the website menu', () => {
        expect(normalizeSize('1/8')).toBe('1/8 oz')
        expect(normalizeSize('ounce')).toBe('1 oz')
        expect(normalizeSize('1 gram')).toBe('1 gram')
        expect(normalizeSize('3grams')).toBe('3 grams')
        expect(normalizeSize('2ct')).toBe('2 count')
        expect(normalizeSize('12 oz can')).toBe('12 oz can')
    })

    it('normalizes parenthesized flower sizes', () => {
        expect(
            normalizeCloverItem({
                ...baseRow,
                Name: 'Blackberry Superboof (1/8)',
                Price: 20,
                SKU: 'FLW-REG-BLACKBERRYSUPERBOOF-3.5G',
            })
        ).toMatchObject({
            name: 'Blackberry Superboof',
            category: 'Flower',
            size: '1/8 oz',
            price: 20,
        })
    })

    it('normalizes gram, count, drink, and vape variants', () => {
        expect(
            normalizeCloverItem({
                ...baseRow,
                Name: 'Pineapple Express Crumble (3 grams) S',
                Categories: 'Crumble & Wax',
                Price: 25,
            })
        ).toMatchObject({
            name: 'Pineapple Express Crumble',
            category: 'Concentrates',
            size: '3 grams',
        })

        expect(
            normalizeCloverItem({
                ...baseRow,
                Name: 'MEGA DOSE Gummies Blue Razz 25mg (2ct)',
                Categories: 'Gummies',
                Price: 5,
            })
        ).toMatchObject({
            name: 'MEGA DOSE Gummies Blue Razz 25mg',
            category: 'Edibles',
            size: '2 count',
        })

        expect(
            normalizeCloverItem({
                ...baseRow,
                Name: 'Moon Water Soda - Berry Twist 30mg (12 oz can)',
                Categories: 'Shots & Drinks',
                Price: 9,
            })
        ).toMatchObject({
            name: 'Moon Water Soda - Berry Twist 30mg',
            category: 'Edibles',
            size: '12 oz can',
        })

        expect(
            normalizeCloverItem({
                ...baseRow,
                Name: 'One Gram Carts (Bomb Pop (Indica))',
                Categories: 'Cartridges',
                Price: 16,
            })
        ).toMatchObject({
            name: 'Bomb Pop (Indica)',
            category: 'Vapes & Carts',
            size: '1 gram cart',
        })
    })

    it('reports missing variants and price mismatches', () => {
        const siteProducts = [
            {
                name: 'Blackberry Superboof',
                category: 'Flower',
                size_options: ['1/8 oz', '1/4 oz'],
                prices: { '1/8 oz': 25, '1/4 oz': 40 },
                thca_percentage: 20,
            },
            {
                name: 'Website Only',
                category: 'Flower',
                size_options: ['1/8 oz'],
                prices: { '1/8 oz': 20 },
            },
        ]
        const cloverRows = [
            {
                ...baseRow,
                Name: 'Blackberry Superboof (1/8)',
                Price: 20,
                SKU: 'FLW-REG-BLACKBERRYSUPERBOOF-3.5G',
            },
            {
                ...baseRow,
                Name: 'Blackberry Superboof (1/4)',
                Price: 40,
                SKU: 'FLW-REG-BLACKBERRYSUPERBOOF-7G',
            },
            {
                ...baseRow,
                Name: 'Clover Only (1/8)',
                Price: 20,
            },
        ]

        const report = reconcileProducts(
            siteProducts,
            normalizeCloverRows(cloverRows)
        )

        expect(report.summary).toMatchObject({
            siteProducts: 2,
            siteVariants: 3,
            cloverVariants: 3,
            matchedVariants: 2,
            siteOnlyVariants: 1,
            cloverOnlyVariants: 1,
            priceMismatches: 1,
        })
        expect(report.priceMismatches[0]).toMatchObject({
            name: 'Blackberry Superboof',
            size: '1/8 oz',
            sitePrice: 25,
            cloverPrice: 20,
        })
    })

    it('builds a proposed grouped products file while preserving website fields', () => {
        const siteProducts = [
            {
                name: 'Blackberry Superboof',
                category: 'Flower',
                size_options: ['1/8 oz'],
                prices: { '1/8 oz': 25 },
                thca_percentage: 20,
                banner: 'New',
            },
        ]
        const cloverRows = [
            {
                ...baseRow,
                Name: 'Blackberry Superboof (1/8)',
                Price: 20,
                Quantity: 0,
            },
            {
                ...baseRow,
                Name: 'Blackberry Superboof (1/4)',
                Price: 40,
            },
        ]

        const nextProducts = buildNextProducts(
            siteProducts,
            normalizeCloverRows(cloverRows)
        )

        expect(nextProducts).toHaveLength(1)
        expect(nextProducts[0]).toMatchObject({
            name: 'Blackberry Superboof',
            category: 'Flower',
            thca_percentage: 20,
            banner: 'New',
            size_options: ['1/8 oz', '1/4 oz'],
            prices: { '1/8 oz': 20, '1/4 oz': 40 },
            availability: { '1/8 oz': 'Out of Stock' },
        })
        expect(nextProducts[0]).not.toHaveProperty('_clover')
        expect(nextProducts[0]).not.toHaveProperty('_review')
    })

    it('does not publish brand-new Clover-only products when every variant is unavailable', () => {
        const cloverRows = [
            {
                ...baseRow,
                Name: 'Hidden Clover Only (1/8)',
                Price: 20,
                'Hidden?': 'Yes',
            },
            {
                ...baseRow,
                Name: 'Zero Quantity Clover Only (1/4)',
                Price: 40,
                Quantity: 0,
            },
            {
                ...baseRow,
                Name: 'Negative Quantity Clover Only (1/2)',
                Price: 80,
                Quantity: -1,
            },
        ]

        const nextProducts = buildNextProducts([], normalizeCloverRows(cloverRows))

        expect(nextProducts).toHaveLength(0)
    })

    it('preserves existing website products even when Clover says they are unavailable', () => {
        const siteProducts = [
            {
                name: 'Blackberry Superboof',
                category: 'Flower',
                size_options: ['1/8 oz'],
                prices: { '1/8 oz': 25 },
                banner: 'New',
            },
        ]
        const cloverRows = [
            {
                ...baseRow,
                Name: 'Blackberry Superboof (1/8)',
                Price: 20,
                Quantity: 0,
            },
        ]

        const nextProducts = buildNextProducts(
            siteProducts,
            normalizeCloverRows(cloverRows)
        )

        expect(nextProducts).toHaveLength(1)
        expect(nextProducts[0]).toMatchObject({
            name: 'Blackberry Superboof',
            banner: 'New',
            availability: { '1/8 oz': 'Out of Stock' },
        })
    })

    it('publishes brand-new Clover products with at least one available variant', () => {
        const cloverRows = [
            {
                ...baseRow,
                Name: 'Mixed Clover Only (1/8)',
                Price: 20,
                Quantity: 0,
            },
            {
                ...baseRow,
                Name: 'Mixed Clover Only (1/4)',
                Price: 40,
                Quantity: 5,
            },
        ]

        const nextProducts = buildNextProducts([], normalizeCloverRows(cloverRows))

        expect(nextProducts).toHaveLength(1)
        expect(nextProducts[0]).toMatchObject({
            name: 'Mixed Clover Only',
            category: 'Flower',
            size_options: ['1/8 oz', '1/4 oz'],
            prices: { '1/8 oz': 20, '1/4 oz': 40 },
            availability: { '1/8 oz': 'Out of Stock' },
        })
    })

    it('clears stale availability when Clover says a matched size is active', () => {
        const siteProducts = [
            {
                name: 'Blackberry Superboof',
                category: 'Flower',
                size_options: ['1/8 oz'],
                prices: { '1/8 oz': 25 },
                availability: { '1/8 oz': 'Out of Stock' },
            },
        ]
        const cloverRows = [
            {
                ...baseRow,
                Name: 'Blackberry Superboof (1/8)',
                Price: 20,
                Quantity: 4,
                'Hidden?': 'No',
            },
        ]

        const nextProducts = buildNextProducts(
            siteProducts,
            normalizeCloverRows(cloverRows)
        )

        expect(nextProducts[0]).not.toHaveProperty('availability')
    })

    it('reads a Clover XLSX export and reconciles it deterministically', () => {
        const exportPath = writeCloverFixture()
        const rows = rowsToObjects(readXlsxSheet(exportPath, 'Items'))
        const cloverItems = normalizeCloverRows(rows)
        const websiteProducts = [
            {
                name: 'Blackberry Superboof',
                category: 'Flower',
                size_options: ['1/8 oz', '1/4 oz'],
                prices: { '1/8 oz': 25, '1/4 oz': 40 },
            },
            {
                name: 'Website Only',
                category: 'Flower',
                size_options: ['1/8 oz'],
                prices: { '1/8 oz': 20 },
            },
        ]
        const report = reconcileProducts(websiteProducts, cloverItems)

        expect(rows).toHaveLength(3)
        expect(report.summary).toMatchInlineSnapshot(`
          {
            "categoryMismatches": 0,
            "cloverOnlyVariants": 1,
            "cloverVariants": 3,
            "matchedVariants": 2,
            "priceMismatches": 1,
            "siteOnlyVariants": 1,
            "siteProducts": 2,
            "siteVariants": 3,
          }
        `)
    })
})
