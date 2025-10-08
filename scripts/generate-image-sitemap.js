import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SITE_URL = 'https://www.route66hemp.com'
const PRODUCTS_PATH = path.join(__dirname, '../public/products/products.json')
const OUTPUT_PATH = path.join(__dirname, '../public/image-sitemap.xml')

const ensureArray = (value) => (Array.isArray(value) ? value : [])

function escapeXml(str = '') {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

function normaliseImagePath(imagePath) {
    if (!imagePath || typeof imagePath !== 'string') {
        return null
    }

    if (imagePath.startsWith('http')) {
        return imagePath
    }

    return `${SITE_URL}${imagePath}`
}

function slugify(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
}

function generateImageSitemap() {
    const raw = fs.readFileSync(PRODUCTS_PATH, 'utf-8')
    const products = JSON.parse(raw)

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`

    xml += `  <url>\n    <loc>${SITE_URL}/</loc>\n    <image:image>\n      <image:loc>${SITE_URL}/assets/images/route-66-hemp-storefront-st-robert-1280w.webp</image:loc>\n      <image:title>Route 66 Hemp - Premium Hemp Store in St Robert, Missouri</image:title>\n      <image:caption>Storefront of Route 66 Hemp serving St Robert, Fort Leonard Wood, and Pulaski County with premium hemp products.</image:caption>\n      <image:geo_location>St Robert, Missouri</image:geo_location>\n    </image:image>\n  </url>\n`

    const grouped = products.reduce((acc, product) => {
        const category = product.category || 'products'
        if (!acc[category]) {
            acc[category] = []
        }
        acc[category].push(product)
        return acc
    }, {})

    Object.entries(grouped).forEach(([category, items]) => {
        ensureArray(items).forEach((product) => {
            const imageUrl = normaliseImagePath(product.image)
            if (!imageUrl) {
                return
            }

            const productName = product.name || 'Route 66 Hemp Product'
            const productSlug = slugify(productName)
            const categorySlug = slugify(category)
            const caption = product.description
                ? escapeXml(product.description)
                : `Premium ${productName} ${category.toLowerCase()} available at Route 66 Hemp in St Robert, Missouri`

            xml += `  <url>\n    <loc>${SITE_URL}/#product-${categorySlug}-${productSlug}</loc>\n    <image:image>\n      <image:loc>${escapeXml(imageUrl)}</image:loc>\n      <image:title>${escapeXml(`${productName} - ${category} | Route 66 Hemp`)}</image:title>\n      <image:caption>${caption}</image:caption>\n      <image:geo_location>St Robert, Missouri</image:geo_location>\n    </image:image>\n  </url>\n`
        })
    })

    xml += '</urlset>\n'

    fs.writeFileSync(OUTPUT_PATH, xml)
    console.log(`✅ Generated image sitemap with ${products.length} products`)
    console.log(`📍 Location: ${OUTPUT_PATH}`)
}

generateImageSitemap()
