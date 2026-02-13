import fs from 'fs'
import path from 'path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'url'
import { buildResponsiveImageManifestFromFiles } from './generate-responsive-image-manifest.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.join(__dirname, '..')
const IMAGES_DIR = path.join(REPO_ROOT, 'public/assets/images')
const MANIFEST_PATH = path.join(REPO_ROOT, 'src/generated/responsiveImageManifest.js')
const SEARCH_DIRS = [path.join(REPO_ROOT, 'src')]
const ROOT_FILES = [path.join(REPO_ROOT, 'app.jsx')]

const RESPONSIVE_IMAGE_TAG_PATTERN = /<ResponsiveImage\b[\s\S]*?\/>/g
const SRC_SET_WIDTHS_PATTERN = /srcSetWidths\s*=\s*\{\s*\[([^\]]+)\]\s*\}/
const STATIC_SRC_PATTERNS = [
    /\bsrc\s*=\s*"([^"]+)"/,
    /\bsrc\s*=\s*'([^']+)'/,
    /\bsrc\s*=\s*\{\s*"([^"]+)"\s*\}/,
    /\bsrc\s*=\s*\{\s*'([^']+)'\s*\}/,
]

const normaliseBaseName = (value) => {
    if (typeof value !== 'string') return null
    const trimmed = value.trim()
    if (!trimmed) return null
    return trimmed.replace(/(-\d+w)?\.[^/.]+$/, '').replace(/-\d+w$/, '')
}

const toManifestKey = (baseName) => {
    if (typeof baseName !== 'string') return null
    const segments = baseName.split('/').filter(Boolean)
    return segments.length ? segments[segments.length - 1] : baseName
}

const parseWidths = (raw) =>
    [...new Set(raw.split(',').map((entry) => Number(entry.trim())).filter((entry) => Number.isFinite(entry) && entry > 0))]
        .sort((a, b) => a - b)

async function getTopLevelImageFiles() {
    const entries = await fs.promises.readdir(IMAGES_DIR, { withFileTypes: true })
    return entries.filter((entry) => entry.isFile()).map((entry) => entry.name)
}

async function collectCodeFiles(dir) {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true })
    const collected = []

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) {
            collected.push(...(await collectCodeFiles(fullPath)))
            continue
        }
        if (!entry.isFile()) continue
        if (!/\.(jsx|tsx)$/.test(entry.name)) continue
        if (/(^|\.)(test|spec)\.(jsx|tsx)$/.test(entry.name)) continue
        if (fullPath.includes(`${path.sep}__tests__${path.sep}`)) continue
        collected.push(fullPath)
    }

    return collected
}

function getStaticSrc(tagMarkup) {
    for (const pattern of STATIC_SRC_PATTERNS) {
        const match = tagMarkup.match(pattern)
        if (match) return match[1]
    }
    return null
}

async function loadGeneratedManifest() {
    const moduleUrl = `${pathToFileURL(MANIFEST_PATH).href}?t=${Date.now()}`
    const manifestModule = await import(moduleUrl)
    return manifestModule.responsiveImageManifest ?? {}
}

async function main() {
    const diskManifest = buildResponsiveImageManifestFromFiles(await getTopLevelImageFiles())
    const generatedManifest = await loadGeneratedManifest()

    const errors = []

    if (JSON.stringify(diskManifest) !== JSON.stringify(generatedManifest)) {
        errors.push(
            `Generated manifest is out of sync with disk assets. Run: node scripts/generate-responsive-image-manifest.js`
        )
    }

    const codeFiles = [
        ...ROOT_FILES.filter((filePath) => fs.existsSync(filePath)),
        ...(await Promise.all(SEARCH_DIRS.filter((dirPath) => fs.existsSync(dirPath)).map((dirPath) => collectCodeFiles(dirPath)))).flat(),
    ]

    for (const filePath of codeFiles) {
        const source = await fs.promises.readFile(filePath, 'utf8')
        const tags = source.match(RESPONSIVE_IMAGE_TAG_PATTERN) ?? []

        for (const tag of tags) {
            const widthsMatch = tag.match(SRC_SET_WIDTHS_PATTERN)
            if (!widthsMatch) continue

            const src = getStaticSrc(tag)
            if (!src || !src.startsWith('/')) continue

            const baseName = normaliseBaseName(src)
            if (!baseName) continue
            const manifestKey = toManifestKey(baseName)
            if (!manifestKey) continue

            const availableWidths = generatedManifest[manifestKey]
            if (!Array.isArray(availableWidths) || availableWidths.length === 0) {
                errors.push(
                    `${path.relative(REPO_ROOT, filePath)} advertises widths for ${manifestKey} but no manifest entry exists.`
                )
                continue
            }

            const declaredWidths = parseWidths(widthsMatch[1])
            if (declaredWidths.length === 0) {
                errors.push(
                    `${path.relative(REPO_ROOT, filePath)} contains an empty srcSetWidths declaration for ${baseName}.`
                )
                continue
            }

            const unavailable = declaredWidths.filter((width) => !availableWidths.includes(width))
            if (unavailable.length > 0) {
                errors.push(
                    `${path.relative(REPO_ROOT, filePath)} advertises missing widths for ${manifestKey}: ${unavailable.join(', ')} (available: ${availableWidths.join(', ')}).`
                )
            }
        }
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
    console.error('Responsive asset validation failed with an unexpected error:', error)
    process.exitCode = 1
})
