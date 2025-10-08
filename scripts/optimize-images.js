import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import process from 'node:process'
import { fileURLToPath } from 'url'
import { generateResponsiveSizes } from './generate-responsive-sizes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const INPUT_DIR = path.join(__dirname, '../public/assets/images/original')
const OUTPUT_DIR = path.join(__dirname, '../public/assets/images/optimized')
const PUBLIC_OUTPUT_DIR = path.join(__dirname, '../public/assets/images')

const compressionSettings = {
    webp: {
        quality: 85,
        effort: 6,
    },
    avif: {
        quality: 80,
        effort: 6,
    },
    jpeg: {
        quality: 85,
        progressive: true,
        mozjpeg: true,
    },
}

const GUARANTEED_SIZES = [1600, 1280]
const PUBLIC_TARGET_SIZES = [1920]

const FORMAT_VARIANTS = [
    {
        extension: 'webp',
        apply: (pipeline) => pipeline.webp(compressionSettings.webp),
    },
    {
        extension: 'avif',
        apply: (pipeline) => pipeline.avif(compressionSettings.avif),
    },
    {
        extension: 'jpg',
        apply: (pipeline) => pipeline.jpeg(compressionSettings.jpeg),
    },
]

const ensureDirs = async () => {
    await Promise.all([
        fs.promises.mkdir(OUTPUT_DIR, { recursive: true }),
        fs.promises.mkdir(PUBLIC_OUTPUT_DIR, { recursive: true }),
    ])
}

async function ensureSizeSet({
    inputPath,
    targetDir,
    baseName,
    sizes,
    label,
    allowUpscale = false,
}) {
    if (!sizes.length) {
        return
    }

    await fs.promises.mkdir(targetDir, { recursive: true })

    for (const size of sizes) {
        const sizeBase = path.join(targetDir, `${baseName}-${size}w`)

        for (const variant of FORMAT_VARIANTS) {
            const outputPath = `${sizeBase}.${variant.extension}`
            const pipeline = sharp(inputPath).resize({
                width: size,
                withoutEnlargement: !allowUpscale,
                fit: 'inside',
            })

            await variant.apply(pipeline).toFile(outputPath)
        }

        console.log(`  ✓ Generated ${size}w ${label} set for ${baseName}`)
    }
}

async function optimizeImage(inputPath, filename) {
    const nameWithoutExt = path.parse(filename).name
    const outputBase = path.join(OUTPUT_DIR, nameWithoutExt)

    const image = sharp(inputPath)
    const metadata = await image.metadata()

    console.log(`Processing: ${filename} (${metadata.width}x${metadata.height})`)

    await image
        .webp(compressionSettings.webp)
        .toFile(`${outputBase}.webp`)
    console.log('  ✓ Created WebP')

    await image
        .avif(compressionSettings.avif)
        .toFile(`${outputBase}.avif`)
    console.log('  ✓ Created AVIF')

    await sharp(inputPath)
        .jpeg(compressionSettings.jpeg)
        .toFile(`${outputBase}.jpg`)
    console.log('  ✓ Created JPEG fallback')

    await generateResponsiveSizes(inputPath, OUTPUT_DIR, nameWithoutExt)
    await ensureSizeSet({
        inputPath,
        targetDir: OUTPUT_DIR,
        baseName: nameWithoutExt,
        sizes: GUARANTEED_SIZES,
        label: 'guaranteed',
        allowUpscale: true,
    })
    await ensureSizeSet({
        inputPath,
        targetDir: PUBLIC_OUTPUT_DIR,
        baseName: nameWithoutExt,
        sizes: PUBLIC_TARGET_SIZES,
        label: 'public',
        allowUpscale: true,
    })

    const originalSize = fs.statSync(inputPath).size
    const webpSize = fs.statSync(`${outputBase}.webp`).size
    const avifSize = fs.statSync(`${outputBase}.avif`).size

    const webpSavings = ((1 - webpSize / originalSize) * 100).toFixed(1)
    const avifSavings = ((1 - avifSize / originalSize) * 100).toFixed(1)

    console.log(`  📊 Original: ${(originalSize / 1024).toFixed(1)}KB`)
    console.log(`  📊 WebP: ${(webpSize / 1024).toFixed(1)}KB (${webpSavings}% savings)`)
    console.log(`  📊 AVIF: ${(avifSize / 1024).toFixed(1)}KB (${avifSavings}% savings)\n`)
}

async function processAllImages() {
    if (!fs.existsSync(INPUT_DIR)) {
        console.warn(
            '⚠️  No `public/assets/images/original` directory found – skipping optimization.'
        )
        return
    }

    await ensureDirs()

    const files = (await fs.promises.readdir(INPUT_DIR, { withFileTypes: true }))
        .filter((entry) => entry.isFile())
        .map((entry) => entry.name)

    const imageFiles = files.filter((file) => /\.(jpe?g|png)$/i.test(file))

    for (const file of imageFiles) {
        const filePath = path.join(INPUT_DIR, file)
        await optimizeImage(filePath, file)
    }

    console.log(`✅ Optimized ${imageFiles.length} images!`)
}

processAllImages().catch((error) => {
    console.error('❌ Image optimization failed:', error)
    process.exitCode = 1
})
