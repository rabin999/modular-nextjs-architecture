/**
 * Feature/Capability Removal Script
 * Safely removes features and capabilities with registry cleanup
 */

import { select, confirm, search } from '@inquirer/prompts'
import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import { glob } from 'glob'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT_DIR = path.resolve(__dirname, '..')
const FEATURES_DIR = path.join(ROOT_DIR, 'src/features')
const REGISTRY_PATH = path.join(FEATURES_DIR, 'registry.ts')

async function getFeatureDirectories(): Promise<string[]> {
    const manifests = await glob('**/*/manifest.ts', {
        cwd: FEATURES_DIR,
        ignore: ['registry.ts', 'types.ts'],
    })
    const dirs = manifests.map(m => path.dirname(m))
    return dirs.filter(d => !d.includes('capabilities'))
}

async function getCapabilityDirectories(): Promise<string[]> {
    const manifests = await glob('**/capabilities/*/manifest.ts', { cwd: FEATURES_DIR })
    return manifests.map(m => path.dirname(m))
}

function pathToRegistryKey(relativePath: string): string {
    return relativePath.replace(/\//g, '-')
}

async function main() {
    console.log(chalk.bold.red('🗑️  Enterprise Feature Remover'))
    console.log(chalk.dim('Safely removes features and capabilities with registry cleanup\n'))

    const type = await select({
        message: 'What do you want to remove?',
        choices: [
            { name: 'Feature (Module)', value: 'feature' },
            { name: 'Capability (Plugin)', value: 'capability' },
        ],
    })

    if (type === 'feature') {
        await removeFeature()
    } else {
        await removeCapability()
    }
}

async function removeFeature() {
    const features = await getFeatureDirectories()

    if (features.length === 0) {
        console.log(chalk.yellow('No features found to remove.'))
        return
    }

    const featurePath = await search({
        message: 'Select feature to remove:',
        source: async term => {
            const matches = features.filter(f => f.toLowerCase().includes((term || '').toLowerCase()))
            return matches.map(f => ({
                name: `${f} (${path.join(FEATURES_DIR, f)})`,
                value: f,
            }))
        },
    })

    const absolutePath = path.join(FEATURES_DIR, featurePath)
    const registryKey = pathToRegistryKey(featurePath)

    console.log(chalk.dim('\nThis will:'))
    console.log(chalk.dim(`  • Delete folder: ${absolutePath}`))
    console.log(chalk.dim(`  • Remove from registry: '${registryKey}'`))

    const capabilities = await glob('capabilities/*/manifest.ts', { cwd: absolutePath })
    if (capabilities.length > 0) {
        console.log(chalk.yellow(`\n⚠️  This feature contains ${capabilities.length} capability(s) that will also be deleted:`))
        capabilities.forEach(cap => {
            console.log(chalk.yellow(`    - ${path.dirname(cap)}`))
        })
    }

    const confirmed = await confirm({
        message: chalk.red('Are you sure you want to delete this feature?'),
        default: false,
    })

    if (!confirmed) {
        console.log(chalk.dim('Cancelled.'))
        return
    }

    await removeFromRegistry(registryKey, 'features')

    for (const cap of capabilities) {
        const capName = path.basename(path.dirname(cap))
        await removeFromRegistry(capName, 'capabilities')
    }

    await fs.remove(absolutePath)

    console.log(chalk.green(`\n✅ Feature "${featurePath}" removed successfully!`))
    console.log(chalk.dim('\nRemember to:'))
    console.log(chalk.dim('  1. Remove any routes in src/app/[locale]/ that use this feature'))
    console.log(chalk.dim('  2. Run npm run check:orphan to verify cleanup'))
}

async function removeCapability() {
    const capabilities = await getCapabilityDirectories()

    if (capabilities.length === 0) {
        console.log(chalk.yellow('No capabilities found to remove.'))
        return
    }

    const capabilityPath = await search({
        message: 'Select capability to remove:',
        source: async term => {
            const matches = capabilities.filter(c => c.toLowerCase().includes((term || '').toLowerCase()))
            return matches.map(c => ({ name: c, value: c }))
        },
    })

    const absolutePath = path.join(FEATURES_DIR, capabilityPath)
    const capabilityName = path.basename(capabilityPath)

    console.log(chalk.dim('\nThis will:'))
    console.log(chalk.dim(`  • Delete folder: ${absolutePath}`))
    console.log(chalk.dim(`  • Remove from registry: '${capabilityName}' or similar`))

    const confirmed = await confirm({
        message: chalk.red('Are you sure you want to delete this capability?'),
        default: false,
    })

    if (!confirmed) {
        console.log(chalk.dim('Cancelled.'))
        return
    }

    await removeFromRegistry(capabilityName, 'capabilities')
    await fs.remove(absolutePath)

    console.log(chalk.green(`\n✅ Capability "${capabilityName}" removed successfully!`))
}

/**
 * Removes an entry from registry.ts by key while preserving formatting
 */
async function removeFromRegistry(key: string, type: 'features' | 'capabilities') {
    const content = await fs.readFile(REGISTRY_PATH, 'utf-8')
    const lines = content.split('\n')
    const newLines: string[] = []
    let removed = false

    for (const line of lines) {
        const keyPattern = new RegExp(`^\\s*['"]${key}['"]\\s*:`)

        if (keyPattern.test(line)) {
            removed = true
            continue
        }

        newLines.push(line)
    }

    if (removed) {
        await fs.writeFile(REGISTRY_PATH, newLines.join('\n'))
        console.log(chalk.dim(`  → Removed '${key}' from ${type} in registry.ts`))
    } else {
        console.log(chalk.yellow(`  ⚠️  Could not find '${key}' in registry (may need manual cleanup)`))
    }
}

main().catch(console.error)
