import fs from 'fs'
import path from 'path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'url'
import { buildResponsiveImageManifestFromFiles } from './generate-responsive-image-manifest.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.join(__dirname, '..')
const IMAGES_DIR = path.join(REPO_ROOT, 'public/assets/images')
const MANIFEST_PATH = path.join(
    REPO_ROOT,
    'src/generated/responsiveImageManifest.js'
)

async function getTopLevelImageFiles() {
    const entries = await fs.promises.readdir(IMAGES_DIR, {
        withFileTypes: true,
    })
    return entries.filter((entry) => entry.isFile()).map((entry) => entry.name)
}

async function loadGeneratedManifest() {
    const moduleUrl = `${pathToFileURL(MANIFEST_PATH).href}?t=${Date.now()}`
    const manifestModule = await import(moduleUrl)
    return manifestModule.responsiveImageManifest ?? {}
}

async function main() {
    const diskManifest = buildResponsiveImageManifestFromFiles(
        await getTopLevelImageFiles()
    )
    const generatedManifest = await loadGeneratedManifest()

    const errors = []

    if (JSON.stringify(diskManifest) !== JSON.stringify(generatedManifest)) {
        errors.push(
            `Generated manifest is out of sync with disk assets. Run: node scripts/generate-responsive-image-manifest.js`
        )
    }

    if (errors.length > 0) {
        console.error('Responsive asset validation failed:')
        for (const error of errors) {
            console.error(`- ${error}`)
        }
        process.exitCode = 1
        return
    }

    console.log('Responsive asset validation passed.')
}

main().catch((error) => {
    console.error(
        'Responsive asset validation failed with an unexpected error:',
        error
    )
    process.exitCode = 1
})
