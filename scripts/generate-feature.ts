/**
 * Feature/Capability Generator Script
 * Scaffolds new features and capabilities following our architectural conventions
 */

import { select, input, search } from '@inquirer/prompts'
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
const CORE_TYPES_PATH = '@/core/types/registry'

// ============================================================================
// UTILITIES
// ============================================================================

function toKebabCase(str: string): string {
    return str
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        ?.map(x => x.toLowerCase())
        .join('-') || str
}

function toPascalCase(str: string): string {
    return str.replace(/(^\w|-\w)/g, text => text.replace(/-/, '').toUpperCase())
}

function toCamelCase(str: string): string {
    return str.replace(/-\w/g, text => text.replace(/-/, '').toUpperCase())
}

async function getFeatureDirectories(): Promise<string[]> {
    const manifests = await glob('**/*/manifest.ts', {
        cwd: FEATURES_DIR,
        ignore: ['registry.ts', 'types.ts']
    })
    const dirs = manifests.map(m => path.dirname(m))
    return dirs.filter(d => !d.includes('capabilities'))
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    console.log(chalk.bold.blue('🚀 Enterprise Feature Generator'))
    console.log(chalk.dim('Following architectural conventions:\n'))
    console.log(chalk.dim('  • Features: src/features/{parent}/{name}/'))
    console.log(chalk.dim('  • Structure: page/, api/, i18n/, capabilities/'))
    console.log(chalk.dim('  • Types: @/core/types/registry'))
    console.log('')

    const type = await select({
        message: 'What do you want to create?',
        choices: [
            { name: 'Feature (New Module)', value: 'Feature' },
            { name: 'Capability (Plugin for existing Feature)', value: 'Capability' },
        ],
    })

    if (type === 'Feature') {
        await createFeature()
    } else {
        await createCapability()
    }
}

// ============================================================================
// FEATURE CREATION
// ============================================================================

async function createFeature() {
    const allDirs = await getFeatureDirectories()

    const parentMode = await select({
        message: 'Where should this feature live?',
        choices: [
            { name: 'Root (e.g. src/features/my-feature)', value: 'root' },
            { name: 'Child of existing feature (e.g. src/features/catalog/my-feature)', value: 'child' }
        ]
    })

    let parentPath = ''
    if (parentMode === 'child') {
        parentPath = await search({
            message: 'Select parent feature:',
            source: async (term) => {
                const matches = allDirs.filter(dir => dir.toLowerCase().includes((term || '').toLowerCase()))
                return matches.map(dir => ({ name: dir, value: dir }))
            }
        })
    }

    const rawName = await input({
        message: 'Feature name (auto-converted to kebab-case):',
        validate: (input) => input.trim().length > 0 || 'Name is required'
    })

    const name = toKebabCase(rawName)
    const featurePath = parentPath
        ? path.join(FEATURES_DIR, parentPath, name)
        : path.join(FEATURES_DIR, name)

    const featureId = parentPath
        ? `${parentPath.replace(/\//g, '-')}-${name}`
        : name

    console.log(chalk.dim(`\nCreating feature at ${featurePath}...`))

    if (fs.existsSync(featurePath)) {
        console.log(chalk.red('❌ Feature already exists!'))
        return
    }

    // Create Directory Structure (following our conventions)
    await fs.ensureDir(path.join(featurePath, 'page'))
    await fs.ensureDir(path.join(featurePath, 'i18n'))

    // Create Page Component
    const componentName = toPascalCase(name) + 'Page'
    const pageContent = `'use client'

import { useTranslations } from 'next-intl'

export function ${componentName}() {
    const t = useTranslations('${toPascalCase(name)}')
    
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">{t('title')}</h1>
            <p className="text-gray-600">{t('description')}</p>
        </div>
    )
}
`
    await fs.writeFile(path.join(featurePath, 'page', `${componentName}.tsx`), pageContent)

    // Create Manifest (using lazy loading pattern)
    const manifestContent = `import type { FeatureManifest } from '${CORE_TYPES_PATH}'
import dynamic from 'next/dynamic'

const ${componentName} = dynamic(() => import('./page/${componentName}').then(m => m.${componentName}))

export const ${toCamelCase(name)}Manifest: FeatureManifest = {
    id: '${featureId}',
    name: '${toPascalCase(name)}',
    enabled: true,
    components: {
        ${componentName},
    },
    messages: {
        en: () => import('./i18n/en.json'),
        ar: () => import('./i18n/ar.json'),
    }
}
`
    await fs.writeFile(path.join(featurePath, 'manifest.ts'), manifestContent)

    // Create i18n files
    const i18nContent = {
        [toPascalCase(name)]: {
            title: `${toPascalCase(name)} Feature`,
            description: `This is the ${toPascalCase(name)} feature.`
        }
    }
    await fs.writeJson(path.join(featurePath, 'i18n', 'en.json'), i18nContent, { spaces: 4 })
    await fs.writeJson(path.join(featurePath, 'i18n', 'ar.json'), {
        [toPascalCase(name)]: {
            title: 'ميزة',
            description: 'هذه ميزة'
        }
    }, { spaces: 4 })

    // Update Registry (lazy-loaded pattern)
    await updateRegistryLazy(name, parentPath, `${toCamelCase(name)}Manifest`, 'features')

    console.log(chalk.green(`\n✅ Feature "${featureId}" created successfully!`))
    console.log(chalk.dim(`\nNext steps:`))
    console.log(chalk.dim(`  1. Add your route: src/app/[locale]/${name}/page.tsx`))
    console.log(chalk.dim(`  2. Load from registry in the route`))
    console.log(chalk.dim(`  3. Customize your feature component`))
}

// ============================================================================
// CAPABILITY CREATION
// ============================================================================

async function createCapability() {
    const features = await getFeatureDirectories()

    if (features.length === 0) {
        console.log(chalk.red('❌ No features found! Create a feature first.'))
        return
    }

    const featurePath = await search({
        message: 'Which feature does this capability belong to?',
        source: async (term) => {
            const matches = features.filter(f => f.toLowerCase().includes((term || '').toLowerCase()))
            return matches.map(f => ({ name: f, value: f }))
        }
    })

    const rawName = await input({
        message: 'Capability name (e.g. edit-product):',
        validate: (val) => val.length > 0 || 'Name is required'
    })
    const name = toKebabCase(rawName)

    const slot = await input({
        message: 'Target Slot (e.g. rowActions, detailActions):',
        default: 'detailActions'
    })

    const absolutePath = path.join(FEATURES_DIR, featurePath, 'capabilities', name)

    if (fs.existsSync(absolutePath)) {
        console.log(chalk.red('❌ Capability already exists!'))
        return
    }

    console.log(chalk.dim(`\nCreating capability at ${absolutePath}...`))

    // Create Directory Structure
    await fs.ensureDir(path.join(absolutePath, 'ui'))
    await fs.ensureDir(path.join(absolutePath, 'i18n'))

    // Create UI Component
    const componentName = toPascalCase(name)
    const componentContent = `'use client'

import { Button } from '@/shared/ui/Button'
import { useTranslations } from 'next-intl'

interface ${componentName}Props {
    productId: number | string
}

export function ${componentName}({ productId }: ${componentName}Props) {
    const t = useTranslations('${toPascalCase(name)}Capability')

    const handleAction = () => {
        console.log('${componentName} action for product:', productId)
        // TODO: Implement your action
    }

    return (
        <Button variant="outline" onClick={handleAction}>
            {t('action')}
        </Button>
    )
}
`
    await fs.writeFile(path.join(absolutePath, 'ui', `${componentName}.tsx`), componentContent)

    // Create Manifest
    const manifestContent = `import type { CapabilityManifest } from '${CORE_TYPES_PATH}'
import dynamic from 'next/dynamic'

const ${componentName} = dynamic(() => import('./ui/${componentName}').then(m => m.${componentName}))

export const ${toCamelCase(name)}Capability: CapabilityManifest = {
    id: '${name}',
    description: '${toPascalCase(name)} capability',
    enabled: true,
    slot: '${slot}',
    component: ${componentName},
    messages: {
        en: () => import('./i18n/en.json'),
    }
}
`
    await fs.writeFile(path.join(absolutePath, 'manifest.ts'), manifestContent)

    // Create i18n
    await fs.writeJson(path.join(absolutePath, 'i18n', 'en.json'), {
        [`${toPascalCase(name)}Capability`]: {
            action: `${toPascalCase(name)} Action`
        }
    }, { spaces: 4 })

    // Update Registry
    await updateRegistryLazy(name, path.join(featurePath, 'capabilities'), `${toCamelCase(name)}Capability`, 'capabilities')

    console.log(chalk.green(`\n✅ Capability "${name}" created successfully!`))
    console.log(chalk.dim(`\nNext steps:`))
    console.log(chalk.dim(`  1. Verify src/features/registry.ts`))
    console.log(chalk.dim(`  2. Use in your feature page via registry config`))
}

// ============================================================================
// REGISTRY UPDATE (Lazy Loading Pattern)
// ============================================================================

async function updateRegistryLazy(name: string, parentPath: string, manifestName: string, type: 'features' | 'capabilities') {
    let content = await fs.readFile(REGISTRY_PATH, 'utf-8')

    // Build the import path
    const importPath = parentPath
        ? `./${parentPath}/${name}/manifest`
        : `./${name}/manifest`

    // Build a registry key
    const registryKey = parentPath
        ? `${parentPath.replace(/\//g, '-')}-${name}`
        : name

    // Check if already exists
    if (content.includes(`'${registryKey}'`)) {
        console.log(chalk.yellow(`⚠️  ${registryKey} already exists in registry`))
        return
    }

    // Find the section and add lazy loader
    const sectionPattern = new RegExp(`${type}:\\s*\\{`)
    const match = content.match(sectionPattern)

    if (match && match.index !== undefined) {
        const insertPos = content.indexOf('{', match.index) + 1
        const newEntry = `\n        '${registryKey}': () => import('${importPath}').then(m => m.${manifestName}),`
        content = content.slice(0, insertPos) + newEntry + content.slice(insertPos)
    }

    await fs.writeFile(REGISTRY_PATH, content)
    console.log(chalk.dim(`  → Updated registry.ts with lazy loader`))
}

main().catch(console.error)
