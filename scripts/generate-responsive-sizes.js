import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const SIZES = [320, 400, 640, 768, 1024, 1280, 1600, 1920]
const EXTENSIONS = ['webp', 'avif', 'jpg']

async function removeStaleSizeSet(outputDir, baseName, size) {
    let removedCount = 0

    for (const extension of EXTENSIONS) {
        const staleFilePath = path.join(outputDir, `${baseName}-${size}w.${extension}`)
        try {
            await fs.promises.unlink(staleFilePath)
            removedCount += 1
        } catch (error) {
            if (error.code !== 'ENOENT') {
                throw error
            }
        }
    }

    return removedCount
}

async function generateResponsiveSizes(inputPath, outputDir, baseName) {
    const image = sharp(inputPath)
    const metadata = await image.metadata()

    await fs.promises.mkdir(outputDir, { recursive: true })

    for (const size of SIZES) {
        if (metadata.width && size > metadata.width) {
            const removedCount = await removeStaleSizeSet(outputDir, baseName, size)
            if (removedCount > 0) {
                console.log(
                    `  Removed ${removedCount} stale file(s) for ${size}w responsive set of ${baseName}`
                )
            }
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
