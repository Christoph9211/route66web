import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import process from 'node:process'
import { fileURLToPath } from 'url'
import { generateResponsiveSizes } from './generate-responsive-sizes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const INPUT_DIR = path.join(__dirname, '../public/assets/images/original')
const OUTPUT_DIR = path.join(__dirname, '../public/assets/images/optimized')

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
    await fs.promises.mkdir(OUTPUT_DIR, { recursive: true })
}

async function ensureGuaranteedResponsiveSizes(inputPath, outputBase, baseName) {
    for (const size of GUARANTEED_SIZES) {
        const sizeBase = `${outputBase}-${size}w`
        let generatedAny = false

        for (const variant of FORMAT_VARIANTS) {
            const outputPath = `${sizeBase}.${variant.extension}`
            if (fs.existsSync(outputPath)) {
                continue
            }

            const pipeline = sharp(inputPath).resize(size, null, {
                withoutEnlargement: false,
            })

            await variant.apply(pipeline).toFile(outputPath)
            generatedAny = true
        }

        if (generatedAny) {
            console.log(`  ✓ Generated ${size}w guaranteed set for ${baseName}`)
        }
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
    await ensureGuaranteedResponsiveSizes(inputPath, outputBase, nameWithoutExt)

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
