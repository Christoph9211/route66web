import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const SIZES = [320, 400, 640, 768, 1024, 1280, 1600, 1920]

async function generateResponsiveSizes(inputPath, outputDir, baseName) {
    const image = sharp(inputPath)
    const metadata = await image.metadata()

    await fs.promises.mkdir(outputDir, { recursive: true })

    for (const size of SIZES) {
        if (metadata.width && size > metadata.width) {
            continue
        }

        const resizeOptions = { withoutEnlargement: true }

        await image
            .clone()
            .resize(size, null, resizeOptions)
            .webp({ quality: 85, effort: 6 })
            .toFile(path.join(outputDir, `${baseName}-${size}w.webp`))

        await image
            .clone()
            .resize(size, null, resizeOptions)
            .avif({ quality: 80, effort: 6 })
            .toFile(path.join(outputDir, `${baseName}-${size}w.avif`))

        await image
            .clone()
            .resize(size, null, resizeOptions)
            .jpeg({ quality: 85, progressive: true, mozjpeg: true })
            .toFile(path.join(outputDir, `${baseName}-${size}w.jpg`))

        console.log(`  ✓ Generated ${size}w responsive set for ${baseName}`)
    }
}

export { generateResponsiveSizes, SIZES }
