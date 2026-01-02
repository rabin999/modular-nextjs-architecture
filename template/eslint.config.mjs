import { readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import importPlugin from 'eslint-plugin-import'
import unusedImportsPlugin from 'eslint-plugin-unused-imports'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * Dynamically generate ESLint zones for feature isolation
 * This prevents cross-feature imports automatically based on folder structure
 */
function generateFeatureZones() {
    const featuresDir = join(__dirname, 'src', 'features')

    // Get all feature directories (excluding files like registry.ts)
    const features = readdirSync(featuresDir)
        .filter(item => {
            const itemPath = join(featuresDir, item)
            return statSync(itemPath).isDirectory()
        })

    // Generate a zone for each feature that blocks imports from other features
    return features.map(feature => ({
        target: `./src/features/${feature}`,
        from: './src/features',
        except: [`./${feature}`],
        message: `Feature '${feature}' cannot import from other features. Use registry or shared modules.`,
    }))
}

// Generate zones dynamically
const featureZones = generateFeatureZones()

export default [
    // Next.js Core Web Vitals config (includes React, React Hooks, and Next.js rules)
    ...nextVitals,
    // Next.js TypeScript config (includes TypeScript-specific rules)
    ...nextTs,
    // Override default ignores and add custom ignores
    {
        ignores: [
            '.next/**',
            'out/**',
            'build/**',
            'next-env.d.ts',
            'node_modules/**',
            'dist/**',
            'coverage/**',
        ],
    },
    // Custom rules for feature isolation and architectural boundaries
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        plugins: {
            import: importPlugin,
            'unused-imports': unusedImportsPlugin,
        },
        rules: {
            // Auto-remove unused imports and variables
            '@typescript-eslint/no-unused-vars': 'off', // Turn off base rule
            'unused-imports/no-unused-imports': 'error', // Auto-removes unused imports
            'unused-imports/no-unused-vars': [
                'warn',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                },
            ],
            // Feature isolation: prevent cross-feature imports
            // Allow parent-level types/files to be imported by children within the same feature
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            // Block imports to other features' subdirectories
                            // This allows: @/features/catalog/types from @/features/catalog/products/*
                            // But blocks: @/features/auth/* from @/features/catalog/*
                            group: ['@/features/*/*/*'],
                            message:
                                'Features should not import from other features directly. Use the registry or shared abstraction. Parent-level types (types.ts, index.ts, manifest.ts, registry.ts) can be imported by children within the same feature.',
                        },
                        {
                            group: ['../../features/*'],
                            message: 'Relative imports between features are forbidden.',
                        },
                    ],
                },
            ],
            // Dynamic feature isolation zones based on folder structure
            'import/no-restricted-paths': [
                'error',
                {
                    zones: [
                        // Dynamically generated feature isolation zones
                        ...featureZones,

                        // Enforce unidirectional flow: shared → features → app
                        {
                            target: './src/features',
                            from: './src/app',
                            message: 'Features cannot import from app layer. Flow must be: core/shared → features → app',
                        },
                        {
                            target: ['./src/core', './src/shared'],
                            from: ['./src/features', './src/app'],
                            message:
                                'Core and Shared cannot import from features or app. They must remain dependency-free.',
                        },
                    ],
                },
            ],
        },
    },
    // Extra protection for Core/Shared layers
    {
        files: ['src/core/**', 'src/shared/**'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['@/features/**'],
                            message: 'Core and Shared modules cannot import from Features.',
                        },
                        {
                            group: ['@/app/**'],
                            message: 'Core and Shared modules cannot import from App layer.',
                        },
                    ],
                },
            ],
        },
    },
]
