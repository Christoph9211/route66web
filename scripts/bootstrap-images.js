import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { Buffer } from 'node:buffer'
import process from 'node:process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = path.join(__dirname, '../public/assets/images')

const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
}

const assets = [
    {
        baseName: 'route-66-hemp-product-placeholder',
        width: 1200,
        height: 1200,
        textLines: ['Route 66 Hemp', 'Premium Hemp Product'],
        description: 'Square placeholder used for Route 66 Hemp product cards',
        background: '#022c22',
        gradient: '#0f766e',
        accent: '#f97316',
        textColor: '#fef3c7',
        fontSize: 96,
        sizes: [320, 400, 640, 768, 1024, 1280, 1600, 1920],
    },
    {
        baseName: 'route-66-hemp-flower-placeholder',
        width: 1200,
        height: 1200,
        textLines: ['Route 66 Hemp', 'Premium Flower'],
        description: 'Placeholder for Flower products',
        background: '#064e3b', // emerald-900
        gradient: '#10b981', // emerald-500
        accent: '#fcd34d', // amber-300
        textColor: '#ecfdf5', // emerald-50
        fontSize: 96,
        sizes: [320, 400, 640, 768, 1024, 1280, 1600, 1920],
    },
    {
        baseName: 'route-66-hemp-edibles-placeholder',
        width: 1200,
        height: 1200,
        textLines: ['Route 66 Hemp', 'Artisan Edibles'],
        description: 'Placeholder for Edible products',
        background: '#4c1d95', // violet-900
        gradient: '#8b5cf6', // violet-500
        accent: '#f472b6', // pink-400
        textColor: '#f5f3ff', // violet-50
        fontSize: 96,
        sizes: [320, 400, 640, 768, 1024, 1280, 1600, 1920],
    },
    {
        baseName: 'route-66-hemp-concentrates-placeholder',
        width: 1200,
        height: 1200,
        textLines: ['Route 66 Hemp', 'Concentrates'],
        description: 'Placeholder for Concentrate products',
        background: '#ea580c', // orange-600
        gradient: '#fbbf24', // amber-400
        accent: '#78350f', // amber-900
        textColor: '#fffbeb', // amber-50
        fontSize: 96,
        sizes: [320, 400, 640, 768, 1024, 1280, 1600, 1920],
    },
    {
        baseName: 'route-66-hemp-vapes-placeholder',
        width: 1200,
        height: 1200,
        textLines: ['Route 66 Hemp', 'Premium Vapes'],
        description: 'Placeholder for Vape products',
        background: '#0e7490', // cyan-700
        gradient: '#22d3ee', // cyan-400
        accent: '#cffafe', // cyan-100
        textColor: '#ecfeff', // cyan-50
        fontSize: 96,
        sizes: [320, 400, 640, 768, 1024, 1280, 1600, 1920],
    },
    {
        baseName: 'route-66-hemp-diamonds-placeholder',
        width: 1200,
        height: 1200,
        textLines: ['Route 66 Hemp', 'Diamonds & Sauce'],
        description: 'Placeholder for Diamonds & Sauce products',
        background: '#1e3a8a', // blue-900
        gradient: '#60a5fa', // blue-400
        accent: '#93c5fd', // blue-300
        textColor: '#eff6ff', // blue-50
        fontSize: 96,
        sizes: [320, 400, 640, 768, 1024, 1280, 1600, 1920],
    },
]

const buildSvg = ({
    baseName,
    width,
    height,
    textLines,
    description,
    background,
    gradient,
    accent,
    textColor,
    fontSize,
}) => {
    const lineHeight = Math.round(fontSize * 1.2)
    const totalTextHeight = lineHeight * textLines.length
    const startY = height / 2 - totalTextHeight / 2 + lineHeight / 2
    const accentHeight = Math.round(height * 0.18)

    const escape = (str) =>
        str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;')

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title>${escape(baseName.replace(/-/g, ' '))}</title>
  <desc>${escape(description)}</desc>
  <defs>
    <linearGradient id="${baseName}-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${background}" />
      <stop offset="100%" stop-color="${gradient}" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#${baseName}-gradient)" />
  <rect width="${width}" height="${accentHeight}" y="${height - accentHeight}" fill="${accent}" opacity="0.85" />
  <g fill="${textColor}" font-family="'Segoe UI', 'Inter', 'Helvetica', 'Arial', sans-serif" font-size="${fontSize}" font-weight="600" text-anchor="middle">
    ${textLines
            .map(
                (line, index) => {
                    const escapedLine = line
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&apos;')
                    return `<text x="${width / 2}" y="${startY + index * lineHeight}" dominant-baseline="middle">${escapedLine}</text>`
                }
            )
            .join('\n    ')}
  </g>
</svg>`

    return Buffer.from(svg)
}

const createRasterVariants = async (asset) => {
    const baseSvg = buildSvg(asset)
    const aspectRatio = asset.height / asset.width

    for (const size of asset.sizes) {
        const height = Math.round(size * aspectRatio)
        const basePath = path.join(OUTPUT_DIR, `${asset.baseName}-${size}w`)

        const fileVariants = [
            {
                extension: 'webp',
                action: (instance) =>
                    instance.webp({ quality: 75, effort: 6 }),
            },
            {
                extension: 'avif',
                action: (instance) =>
                    instance.avif({ quality: 50, effort: 5 }),
            },
            {
                extension: 'jpg',
                action: (instance) =>
                    instance.jpeg({ quality: 75, progressive: true }),
            },
        ]

        for (const variant of fileVariants) {
            const filePath = `${basePath}.${variant.extension}`
            ensureDir(path.dirname(filePath))

            if (fs.existsSync(filePath)) {
                continue
            }

            const pipeline = sharp(baseSvg).resize(size, height, {
                fit: 'cover',
                withoutEnlargement: true,
            })

            await variant.action(pipeline).toFile(filePath)
        }
    }
}

const createBlurPlaceholder = async () => {
    const size = 32
    const filePath = path.join(OUTPUT_DIR, 'placeholder-blur.webp')

    if (fs.existsSync(filePath)) {
        return
    }

    await sharp({
        create: {
            width: size,
            height: size,
            channels: 3,
            background: { r: 15, g: 64, b: 43 },
        },
    })
        .blur(6)
        .webp({ quality: 50 })
        .toFile(filePath)
}

const main = async () => {
    ensureDir(OUTPUT_DIR)

    for (const asset of assets) {
        await createRasterVariants(asset)
    }

    await createBlurPlaceholder()

    console.log('✅ Image placeholders generated in public/assets/images')
}

main().catch((error) => {
    console.error('Failed to generate placeholder assets:', error)
    process.exitCode = 1
})
