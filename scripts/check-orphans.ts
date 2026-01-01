/**
 * Orphan Detection Script
 * Scans for manifest.ts files that are not registered in the registry
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const registryPath = path.resolve(__dirname, '../src/features/registry.ts')
const featuresDir = path.resolve(__dirname, '../src/features')

function findManifests(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir)

    files.forEach(file => {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)

        if (stat.isDirectory()) {
            findManifests(filePath, fileList)
        } else if (file === 'manifest.ts') {
            fileList.push(filePath)
        }
    })

    return fileList
}

function main() {
    console.log('🔍 Scanning for orphan manifests...\n')

    if (!fs.existsSync(registryPath)) {
        console.error('❌ Registry file not found:', registryPath)
        process.exit(1)
    }

    const registryContent = fs.readFileSync(registryPath, 'utf-8')
    const allManifests = findManifests(featuresDir)

    let orphans = 0
    const registered: string[] = []

    allManifests.forEach(manifestPath => {
        const relativePath = path.relative(featuresDir, manifestPath)
        // Convert to import path format: catalog/products/manifest.ts -> ./catalog/products/manifest
        const importPath = './' + relativePath.replace(/\\/g, '/').replace('.ts', '')

        // Also check folder name (for lazy imports like 'catalog-products')
        const normalized = relativePath.replace(/\\/g, '/').replace('/manifest.ts', '')
        const parts = normalized.split('/')
        const folderName = parts[parts.length - 1]

        // Check both import path and folder name
        const isRegistered = registryContent.includes(importPath) ||
            registryContent.includes(`'${folderName}'`) ||
            registryContent.includes(`"${folderName}"`) ||
            registryContent.includes(folderName + 'Manifest') ||
            registryContent.includes(folderName + 'Capability')

        if (!isRegistered) {
            console.warn(`⚠️  ORPHAN: ${relativePath}`)
            orphans++
        } else {
            registered.push(relativePath)
        }
    })

    console.log('\n---')
    console.log(`✅ Registered: ${registered.length}`)
    console.log(`⚠️  Orphans: ${orphans}`)
    console.log('---\n')

    if (orphans > 0) {
        console.log('💡 Tip: Either register these manifests in src/features/registry.ts or delete them.')
        process.exit(1)
    } else {
        console.log('All manifests are properly registered!')
        process.exit(0)
    }
}

main()
