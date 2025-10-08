import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const renamingRules = {
    'android-chrome-192x192.png': 'route-66-hemp-logo-192x192.png',
    'android-chrome-512x512.png': 'route-66-hemp-logo-512x512.png',
    'apple-touch-icon.png': 'route-66-hemp-icon-180x180.png',
    'favicon-16x16.png': 'route-66-hemp-favicon-16x16.png',
    'favicon-32x32.png': 'route-66-hemp-favicon-32x32.png',
}

const publicDir = path.join(__dirname, '../public')

function renameImages() {
    Object.entries(renamingRules).forEach(([oldName, newName]) => {
        const oldPath = path.join(publicDir, oldName)
        const newPath = path.join(publicDir, newName)

        if (fs.existsSync(oldPath)) {
            fs.renameSync(oldPath, newPath)
            console.log(`✓ Renamed: ${oldName} → ${newName}`)
        } else if (fs.existsSync(newPath)) {
            console.log(`• Already renamed: ${newName}`)
        } else {
            console.log(`✗ File not found: ${oldName}`)
        }
    })
}

renameImages()
