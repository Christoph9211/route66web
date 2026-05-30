#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'

const CATEGORY_MAP = {
    'Regular Flower': 'Flower',
    'Snowcaps (Coated Flower)': 'Flower',
    Prerolls: 'Flower',
    'Crumble & Wax': 'Concentrates',
    'Other Concentrates': 'Concentrates',
    Gummies: 'Edibles',
    'Shots & Drinks': 'Edibles',
    Cartridges: 'Vapes & Carts',
    Disposables: 'Vapes & Carts',
    Miscellaneous: 'Other',
}

const SIZE_ALIASES = {
    '1/8': '1/8 oz',
    eighth: '1/8 oz',
    '1/4': '1/4 oz',
    quarter: '1/4 oz',
    '1/2': '1/2 oz',
    half: '1/2 oz',
    ounce: '1 oz',
    oz: '1 oz',
    '1 oz': '1 oz',
    '3.5g': '1/8 oz',
    '3.5 g': '1/8 oz',
    '7g': '1/4 oz',
    '7 g': '1/4 oz',
    '14g': '1/2 oz',
    '14 g': '1/2 oz',
    '28g': '1 oz',
    '28 g': '1 oz',
    '1g': '1 gram',
    '1 g': '1 gram',
    '1gram': '1 gram',
    '1 gram': '1 gram',
    '2.5g': '2.5 grams',
    '2.5 g': '2.5 grams',
    '2.5gram': '2.5 grams',
    '2.5grams': '2.5 grams',
    '2.5 grams': '2.5 grams',
    '3g': '3 grams',
    '3 g': '3 grams',
    '3gram': '3 grams',
    '3grams': '3 grams',
    '3 grams': '3 grams',
    '2ct': '2 count',
    '2 ct': '2 count',
    '2 count': '2 count',
    '4ct': '4 count',
    '4 ct': '4 count',
    '4 count': '4 count',
    '10ct': '10 count',
    '10 ct': '10 count',
    '10 count': '10 count',
    '12 oz can': '12 oz can',
    '2oz bottle': '2 oz bottle',
    '2 oz bottle': '2 oz bottle',
}

const SIZE_ORDER = [
    '1 gram',
    '2.5 grams',
    '3 grams',
    '1/8 oz',
    '1/4 oz',
    '1/2 oz',
    '1 oz',
    '2 count',
    '4 count',
    '10 count',
    '12 oz can',
    '2 oz bottle',
]

const REPORT_LIMIT = 500

const decodeXml = (value = '') =>
    value
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')

const normalizeSpace = (value) =>
    String(value ?? '')
        .replace(/\s+/g, ' ')
        .trim()

export const normalizeLookup = (value) =>
    normalizeSpace(value)
        .toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim()

export const normalizeSize = (value) => {
    const cleaned = normalizeSpace(value)
        .toLowerCase()
        .replace(/ounces?/g, 'oz')
        .replace(/\bgrams?\b/g, 'gram')
        .replace(/\bcounts?\b/g, 'ct')
        .replace(/\s+/g, ' ')

    if (SIZE_ALIASES[cleaned]) return SIZE_ALIASES[cleaned]
    if (/^\d+(?:\.\d+)?\s*gram$/.test(cleaned)) {
        const amount = cleaned.replace(/\s*gram$/, '')
        return amount === '1' ? '1 gram' : `${amount} grams`
    }
    if (/^\d+\s*ct$/.test(cleaned)) {
        return `${cleaned.replace(/\s*ct$/, '')} count`
    }
    return cleaned || null
}

const isKnownSize = (value) => {
    const cleaned = normalizeSpace(value)
        .toLowerCase()
        .replace(/ounces?/g, 'oz')
        .replace(/\bgrams?\b/g, 'gram')
        .replace(/\bcounts?\b/g, 'ct')
        .replace(/\s+/g, ' ')

    return (
        Boolean(SIZE_ALIASES[cleaned]) ||
        /^\d+(?:\.\d+)?\s*gram$/.test(cleaned) ||
        /^\d+\s*ct$/.test(cleaned)
    )
}

const normalizePrice = (value) => {
    if (value === null || value === undefined || value === '') return null
    const price = Number(value)
    if (!Number.isFinite(price)) return null
    return Number(price.toFixed(2))
}

const sortSizes = (sizes) =>
    [...sizes].sort((a, b) => {
        const left = SIZE_ORDER.indexOf(a)
        const right = SIZE_ORDER.indexOf(b)
        if (left !== -1 || right !== -1) {
            if (left === -1) return 1
            if (right === -1) return -1
            return left - right
        }
        return a.localeCompare(b)
    })

const readUInt64LE = (buffer, offset) =>
    Number(buffer.readBigUInt64LE(offset))

const findEndOfCentralDirectory = (buffer) => {
    for (let offset = buffer.length - 22; offset >= 0; offset -= 1) {
        if (buffer.readUInt32LE(offset) === 0x06054b50) return offset
    }
    throw new Error('Invalid XLSX: end of central directory not found')
}

const readZipEntries = (filePath) => {
    const buffer = fs.readFileSync(filePath)
    const eocd = findEndOfCentralDirectory(buffer)
    let entryCount = buffer.readUInt16LE(eocd + 10)
    let centralDirectoryOffset = buffer.readUInt32LE(eocd + 16)

    if (entryCount === 0xffff || centralDirectoryOffset === 0xffffffff) {
        const locatorOffset = eocd - 20
        if (buffer.readUInt32LE(locatorOffset) !== 0x07064b50) {
            throw new Error('Invalid ZIP64 XLSX: locator not found')
        }
        const zip64EocdOffset = readUInt64LE(buffer, locatorOffset + 8)
        entryCount = readUInt64LE(buffer, zip64EocdOffset + 32)
        centralDirectoryOffset = readUInt64LE(buffer, zip64EocdOffset + 48)
    }

    const entries = new Map()
    let offset = centralDirectoryOffset
    for (let i = 0; i < entryCount; i += 1) {
        if (buffer.readUInt32LE(offset) !== 0x02014b50) {
            throw new Error('Invalid XLSX: central directory is corrupt')
        }

        const compression = buffer.readUInt16LE(offset + 10)
        const compressedSize = buffer.readUInt32LE(offset + 20)
        const fileNameLength = buffer.readUInt16LE(offset + 28)
        const extraLength = buffer.readUInt16LE(offset + 30)
        const commentLength = buffer.readUInt16LE(offset + 32)
        const localHeaderOffset = buffer.readUInt32LE(offset + 42)
        const nameStart = offset + 46
        const name = buffer
            .subarray(nameStart, nameStart + fileNameLength)
            .toString('utf8')

        const localNameLength = buffer.readUInt16LE(localHeaderOffset + 26)
        const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28)
        const dataStart =
            localHeaderOffset + 30 + localNameLength + localExtraLength
        const compressed = buffer.subarray(
            dataStart,
            dataStart + compressedSize
        )

        let data
        if (compression === 0) {
            data = compressed
        } else if (compression === 8) {
            data = zlib.inflateRawSync(compressed)
        } else {
            throw new Error(`Unsupported XLSX compression method: ${compression}`)
        }

        entries.set(name.replace(/\\/g, '/'), data.toString('utf8'))
        offset += 46 + fileNameLength + extraLength + commentLength
    }

    return entries
}

const parseAttributes = (tag) => {
    const attrs = {}
    const attrRegex = /([\w:.-]+)="([^"]*)"/g
    for (const match of tag.matchAll(attrRegex)) {
        attrs[match[1]] = decodeXml(match[2])
    }
    return attrs
}

const parseSharedStrings = (xml = '') => {
    const strings = []
    const itemRegex = /<si\b[^>]*>([\s\S]*?)<\/si>/g
    for (const item of xml.matchAll(itemRegex)) {
        const text = [...item[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)]
            .map((match) => decodeXml(match[1]))
            .join('')
        strings.push(text)
    }
    return strings
}

const parseWorksheetRows = (xml, sharedStrings = []) => {
    const rows = []
    const rowRegex = /<row\b[^>]*>([\s\S]*?)<\/row>/g
    for (const rowMatch of xml.matchAll(rowRegex)) {
        const cells = []
        const cellRegex = /<c\b([^>]*)>([\s\S]*?)<\/c>|<c\b([^>]*)\/>/g
        for (const cellMatch of rowMatch[1].matchAll(cellRegex)) {
            const attrs = parseAttributes(cellMatch[1] || cellMatch[3] || '')
            const ref = attrs.r || ''
            const colRef = ref.match(/[A-Z]+/)?.[0] || ''
            const colIndex = columnNameToIndex(colRef)
            const body = cellMatch[2] || ''
            let value = ''

            const inline = body.match(/<is\b[^>]*>([\s\S]*?)<\/is>/)
            const inlineText = inline?.[1]
                ? [...inline[1].matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)]
                      .map((match) => decodeXml(match[1]))
                      .join('')
                : null
            const raw = body.match(/<v\b[^>]*>([\s\S]*?)<\/v>/)?.[1]

            if (attrs.t === 's' && raw !== undefined) {
                value = sharedStrings[Number(raw)] ?? ''
            } else if (attrs.t === 'inlineStr') {
                value = inlineText ?? ''
            } else if (attrs.t === 'str') {
                value = decodeXml(raw ?? '')
            } else if (raw !== undefined) {
                const decoded = decodeXml(raw)
                value = decoded !== '' && !Number.isNaN(Number(decoded))
                    ? Number(decoded)
                    : decoded
            } else {
                value = inlineText ?? ''
            }

            cells[colIndex] = value
        }
        rows.push(cells.map((cell) => (cell === undefined ? '' : cell)))
    }
    return rows
}

const columnNameToIndex = (name) => {
    let index = 0
    for (const char of name) {
        index = index * 26 + char.charCodeAt(0) - 64
    }
    return Math.max(index - 1, 0)
}

const resolvePath = (base, target) => {
    const normalizedBase = path.posix.dirname(base)
    return path.posix.normalize(path.posix.join(normalizedBase, target))
}

export const readXlsxSheet = (filePath, sheetName) => {
    const entries = readZipEntries(filePath)
    const workbookXml = entries.get('xl/workbook.xml')
    const relsXml = entries.get('xl/_rels/workbook.xml.rels')
    if (!workbookXml || !relsXml) {
        throw new Error('Invalid XLSX: workbook metadata not found')
    }

    const rels = new Map()
    for (const rel of relsXml.matchAll(/<Relationship\b([^>]*)\/>/g)) {
        const attrs = parseAttributes(rel[1])
        rels.set(attrs.Id, attrs.Target)
    }

    const sheet = [...workbookXml.matchAll(/<sheet\b([^>]*)\/>/g)]
        .map((match) => parseAttributes(match[1]))
        .find((attrs) => attrs.name === sheetName)
    if (!sheet) throw new Error(`Sheet not found: ${sheetName}`)

    const target = rels.get(sheet['r:id'])
    if (!target) throw new Error(`Worksheet relationship not found: ${sheetName}`)
    const sheetPath = resolvePath('xl/workbook.xml', target)
    const worksheetXml = entries.get(sheetPath)
    if (!worksheetXml) throw new Error(`Worksheet file not found: ${sheetPath}`)

    return parseWorksheetRows(
        worksheetXml,
        parseSharedStrings(entries.get('xl/sharedStrings.xml') || '')
    )
}

export const rowsToObjects = (rows) => {
    const [headers = [], ...body] = rows
    return body
        .filter((row) => row.some((value) => value !== '' && value !== null))
        .map((row) =>
            Object.fromEntries(
                headers.map((header, index) => [header, row[index] ?? ''])
            )
        )
}

const parseParenthesizedSize = (name) => {
    const matches = [...String(name).matchAll(/\(([^()]*)\)/g)]
    for (let index = matches.length - 1; index >= 0; index -= 1) {
        const raw = matches[index][1].trim()
        if (!isKnownSize(raw)) continue
        const normalized = normalizeSize(raw)
        const cleanedName = normalizeSpace(
            String(name)
                .replace(matches[index][0], '')
                .replace(/\s+[ISH]\s*$/i, '')
        )
        return { name: cleanedName, size: normalized }
    }
    return null
}

const parseSkuSize = (sku) => {
    const match = normalizeSpace(sku).match(/-(\d+(?:\.\d+)?G|\d+CT)$/i)
    if (!match) return null
    return normalizeSize(match[1])
}

const parseTrailingSize = (name) => {
    const match = normalizeSpace(name).match(
        /\b(\d+(?:\.\d+)?\s*(?:grams?|g)|\d+\s*ct)\s*[ISH]?\s*$/i
    )
    if (!match) return null
    return {
        name: normalizeSpace(name).slice(0, match.index).trim(),
        size: normalizeSize(match[1]),
    }
}

const parseVapeVariant = (name, category) => {
    if (category !== 'Vapes & Carts') return null
    const text = normalizeSpace(name)
    const outer = text.match(/^(One Gram Carts?|One Gram Disposable)\s*\((.*)\)$/i)
    if (!outer) return null
    return {
        name: normalizeSpace(outer[2]),
        size: outer[1].toLowerCase().includes('cart')
            ? '1 gram cart'
            : '1 gram disposable',
    }
}

export const normalizeCloverItem = (row) => {
    const sourceCategory = normalizeSpace(row.Categories)
    const category = CATEGORY_MAP[sourceCategory]
    const price = normalizePrice(row.Price)
    if (!category || price === null || row['Non-revenue item?'] === 'Yes') {
        return null
    }

    const originalName = normalizeSpace(row.Name)
    const parsed =
        parseVapeVariant(originalName, category) ||
        parseParenthesizedSize(originalName) ||
        parseTrailingSize(originalName)
    const skuSize = parseSkuSize(row.SKU || row['Product Code'])
    const name = normalizeSpace(parsed?.name || originalName)
    const size = parsed?.size || skuSize

    if (!name || !size) return null

    return {
        cloverId: normalizeSpace(row['Clover ID']),
        sku: normalizeSpace(row.SKU || row['Product Code']),
        sourceName: originalName,
        name,
        nameKey: normalizeLookup(name),
        sourceCategory,
        category,
        size,
        price,
        quantity: row.Quantity === '' ? null : Number(row.Quantity),
        hidden: row['Hidden?'] === 'Yes',
    }
}

export const normalizeCloverRows = (rows) =>
    rows
        .map(normalizeCloverItem)
        .filter(Boolean)
        .reduce((items, item) => {
            const key = variantKey(item)
            const existing = items.get(key)
            if (!existing || item.cloverId) items.set(key, item)
            return items
        }, new Map())

export const variantKey = (item) =>
    `${item.nameKey || normalizeLookup(item.name)}::${item.category}::${item.size}`

const siteVariantRows = (products) =>
    products.flatMap((product) =>
        (Array.isArray(product.size_options) ? product.size_options : []).map(
            (size) => {
                const normalizedSize = isKnownSize(size)
                    ? normalizeSize(size)
                    : size
                return {
                    name: product.name,
                    nameKey: normalizeLookup(product.name),
                    category: product.category,
                    size: normalizedSize,
                    sourceSize: size,
                    price: normalizePrice(product.prices?.[size]),
                    product,
                }
            }
        )
    )

const byProductKey = (products) =>
    new Map(
        products.map((product) => [
            `${normalizeLookup(product.name)}::${product.category}`,
            product,
        ])
    )

const closeMatches = (needle, haystack, limit = 3) => {
    const scored = haystack
        .map((candidate) => ({
            candidate,
            score: similarity(needle.nameKey, candidate.nameKey),
        }))
        .filter(({ score }) => score >= 0.55)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)

    return scored.map(({ candidate, score }) => ({
        name: candidate.name,
        category: candidate.category,
        score: Number(score.toFixed(2)),
    }))
}

const similarity = (left, right) => {
    if (!left || !right) return 0
    if (left === right) return 1
    const leftSet = new Set(left.split(' '))
    const rightSet = new Set(right.split(' '))
    const intersection = [...leftSet].filter((value) => rightSet.has(value))
    const union = new Set([...leftSet, ...rightSet])
    return intersection.length / union.size
}

const concise = (items) => items.slice(0, REPORT_LIMIT)

export const reconcileProducts = (siteProducts, cloverItemsMap) => {
    const cloverItems = [...cloverItemsMap.values()]
    const siteRows = siteVariantRows(siteProducts)
    const siteMap = new Map(siteRows.map((row) => [variantKey(row), row]))
    const siteProductsByKey = byProductKey(siteProducts)
    const cloverProductCandidates = [
        ...new Map(
            cloverItems.map((item) => [
                `${item.nameKey}::${item.category}`,
                {
                    name: item.name,
                    nameKey: item.nameKey,
                    category: item.category,
                },
            ])
        ).values(),
    ]
    const siteProductCandidates = siteProducts.map((product) => ({
        name: product.name,
        nameKey: normalizeLookup(product.name),
        category: product.category,
    }))

    const matchingKeys = [...siteMap.keys()].filter((key) =>
        cloverItemsMap.has(key)
    )
    const priceMismatches = matchingKeys
        .map((key) => ({
            key,
            site: siteMap.get(key),
            clover: cloverItemsMap.get(key),
        }))
        .filter(({ site, clover }) => site.price !== clover.price)
        .map(({ site, clover }) => ({
            name: site.name,
            category: site.category,
            size: site.size,
            sitePrice: site.price,
            cloverPrice: clover.price,
            sku: clover.sku,
            cloverId: clover.cloverId,
        }))

    const siteOnly = [...siteMap.entries()]
        .filter(([key]) => !cloverItemsMap.has(key))
        .map(([, site]) => ({
            name: site.name,
            category: site.category,
            size: site.size,
            sitePrice: site.price,
            likelyCloverMatches: closeMatches(site, cloverProductCandidates),
        }))

    const cloverOnly = [...cloverItemsMap.entries()]
        .filter(([key]) => !siteMap.has(key))
        .map(([, clover]) => ({
            name: clover.name,
            sourceName: clover.sourceName,
            category: clover.category,
            sourceCategory: clover.sourceCategory,
            size: clover.size,
            cloverPrice: clover.price,
            sku: clover.sku,
            cloverId: clover.cloverId,
            hidden: clover.hidden,
            quantity: clover.quantity,
            likelySiteMatches: closeMatches(clover, siteProductCandidates),
        }))

    const categoryMismatches = [
        ...new Map(cloverItems.map((clover) => [clover.nameKey, clover])).values(),
    ]
        .filter(
            (clover) =>
                !siteProductsByKey.has(`${clover.nameKey}::${clover.category}`)
        )
        .map((clover) => {
            const sameName = siteProducts.find(
                (product) => normalizeLookup(product.name) === clover.nameKey
            )
            if (!sameName || sameName.category === clover.category) return null
            return {
                name: clover.name,
                siteCategory: sameName.category,
                cloverCategory: clover.category,
                sourceCategory: clover.sourceCategory,
            }
        })
        .filter(Boolean)

    return {
        summary: {
            siteProducts: siteProducts.length,
            siteVariants: siteRows.length,
            cloverVariants: cloverItems.length,
            matchedVariants: matchingKeys.length,
            siteOnlyVariants: siteOnly.length,
            cloverOnlyVariants: cloverOnly.length,
            priceMismatches: priceMismatches.length,
            categoryMismatches: categoryMismatches.length,
        },
        priceMismatches: concise(priceMismatches),
        siteOnly: concise(siteOnly),
        cloverOnly: concise(cloverOnly),
        categoryMismatches: concise(categoryMismatches),
    }
}

export const buildNextProducts = (siteProducts, cloverItemsMap) => {
    const currentProducts = byProductKey(siteProducts)
    const grouped = new Map()

    for (const item of cloverItemsMap.values()) {
        const productKey = `${item.nameKey}::${item.category}`
        const existing = currentProducts.get(productKey)
        const name = existing?.name || item.name
        const key = `${normalizeLookup(name)}::${item.category}`
        if (!grouped.has(key)) {
            grouped.set(key, {
                ...(existing || {}),
                name,
                category: item.category,
                size_options: [],
                prices: {},
                availability: {},
            })
        }

        const product = grouped.get(key)
        if (!product.size_options.includes(item.size)) {
            product.size_options.push(item.size)
        }
        product.prices[item.size] = item.price

        if (item.hidden || item.quantity <= 0) {
            product.availability = {
                ...(product.availability || {}),
                [item.size]: 'Out of Stock',
            }
        }
    }

    for (const product of siteProducts) {
        const key = `${normalizeLookup(product.name)}::${product.category}`
        if (!grouped.has(key)) {
            grouped.set(key, {
                ...product,
                banner: product.banner || 'Out of Stock',
            })
        }
    }

    return [...grouped.values()]
        .map((product) => {
            const sortedSizes = sortSizes(product.size_options || [])
            const sortedPrices = {}
            for (const size of sortedSizes) sortedPrices[size] = product.prices[size]
            const nextProduct = {
                ...product,
                size_options: sortedSizes,
                prices: sortedPrices,
            }
            if (
                nextProduct.availability &&
                Object.keys(nextProduct.availability).length === 0
            ) {
                delete nextProduct.availability
            }
            return nextProduct
        })
        .sort((a, b) =>
            `${a.category} ${a.name}`.localeCompare(`${b.category} ${b.name}`)
        )
}

const reportMarkdown = (report, files) => {
    const lines = [
        '# Clover Product Reconciliation',
        '',
        `Clover export: ${files.cloverPath}`,
        `Website products: ${files.productsPath}`,
        '',
        '## Summary',
        '',
        ...Object.entries(report.summary).map(
            ([key, value]) => `- ${key}: ${value}`
        ),
        '',
        '## Review Files',
        '',
        `- JSON report: ${files.reportJsonPath}`,
        `- Proposed menu JSON: ${files.nextJsonPath}`,
        '',
        '## Price Mismatches',
        '',
        table(
            report.priceMismatches,
            ['name', 'category', 'size', 'sitePrice', 'cloverPrice', 'sku'],
            'No price mismatches.'
        ),
        '',
        '## Clover Only',
        '',
        table(
            report.cloverOnly.slice(0, 50),
            ['name', 'category', 'size', 'cloverPrice', 'hidden', 'quantity'],
            'No Clover-only variants.'
        ),
        '',
        '## Website Only',
        '',
        table(
            report.siteOnly.slice(0, 50),
            ['name', 'category', 'size', 'sitePrice'],
            'No website-only variants.'
        ),
    ]

    return `${lines.join('\n')}\n`
}

const table = (rows, columns, emptyMessage) => {
    if (!rows.length) return emptyMessage
    const header = `| ${columns.join(' | ')} |`
    const divider = `| ${columns.map(() => '---').join(' | ')} |`
    const body = rows.map(
        (row) =>
            `| ${columns
                .map((column) =>
                    String(row[column] ?? '')
                        .replace(/\|/g, '\\|')
                        .replace(/\n/g, ' ')
                )
                .join(' | ')} |`
    )
    return [header, divider, ...body].join('\n')
}

export const runReconciliation = ({
    cloverPath,
    productsPath = path.resolve('public/products/products.json'),
    outputDir = path.resolve('output/product-reconciliation'),
}) => {
    if (!cloverPath) throw new Error('Usage: npm run reconcile:products -- <xlsx>')

    const rows = rowsToObjects(readXlsxSheet(cloverPath, 'Items'))
    const siteProducts = JSON.parse(fs.readFileSync(productsPath, 'utf8'))
    const cloverItems = normalizeCloverRows(rows)
    const report = reconcileProducts(siteProducts, cloverItems)
    const nextProducts = buildNextProducts(siteProducts, cloverItems)

    fs.mkdirSync(outputDir, { recursive: true })
    const reportJsonPath = path.join(outputDir, 'reconciliation-report.json')
    const reportMdPath = path.join(outputDir, 'reconciliation-report.md')
    const nextJsonPath = path.join(outputDir, 'products.next.json')

    fs.writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`)
    fs.writeFileSync(nextJsonPath, `${JSON.stringify(nextProducts, null, 2)}\n`)
    fs.writeFileSync(
        reportMdPath,
        reportMarkdown(report, {
            cloverPath,
            productsPath,
            reportJsonPath,
            nextJsonPath,
        })
    )

    return {
        report,
        files: {
            reportJsonPath,
            reportMdPath,
            nextJsonPath,
        },
    }
}

const isCli =
    process.argv[1] &&
    fileURLToPath(import.meta.url) === path.resolve(process.argv[1])

if (isCli) {
    try {
        const result = runReconciliation({ cloverPath: process.argv[2] })
        console.log(JSON.stringify(result.report.summary, null, 2))
        console.log(`Report: ${result.files.reportMdPath}`)
        console.log(`Proposed products JSON: ${result.files.nextJsonPath}`)
    } catch (error) {
        console.error(error.message)
        process.exitCode = 1
    }
}
