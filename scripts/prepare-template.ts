/**
 * Prepare Template Script
 * Cleans the current project and moves it to template/ directory for CLI usage
 */

import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import { glob } from 'glob'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '..')
const TEMPLATE_DIR = path.join(ROOT_DIR, 'template')

async function main() {
    console.log(chalk.bold.blue('🧹 Preparing Template Directory'))
    console.log(chalk.dim('This will clean the project and prepare it as a template\n'))

    // Remove existing template directory
    if (fs.existsSync(TEMPLATE_DIR)) {
        console.log(chalk.dim('Removing existing template directory...'))
        await fs.remove(TEMPLATE_DIR)
    }

    console.log(chalk.dim('Creating template structure...'))
    await fs.ensureDir(TEMPLATE_DIR)

    // Files/directories to copy
    const copyItems = [
        'src',
        'scripts',
        'messages',
        'eslint.config.mjs',
        'knip.json',
        'next.config.mjs',
        'next-env.d.ts',
        'postcss.config.js',
        'tailwind.config.ts',
        'tsconfig.json',
        'vitest.config.ts',
        'vitest.setup.ts',
        '.gitignore',
        '.editorconfig',
        'LICENSE',
    ]

    // Copy files
    for (const item of copyItems) {
        const src = path.join(ROOT_DIR, item)
        const dest = path.join(TEMPLATE_DIR, item)

        if (fs.existsSync(src)) {
            console.log(chalk.dim(`  Copying ${item}...`))
            await fs.copy(src, dest)
        }
    }

    // Create template package.json (will be customized by CLI)
    const templatePackageJson = {
        name: 'PLACEHOLDER_APP_NAME',
        version: '0.1.0',
        description: 'PLACEHOLDER_DESCRIPTION',
        author: 'PLACEHOLDER_AUTHOR',
        license: 'MIT',
        private: true,
        scripts: {
            dev: 'next dev',
            build: 'next build',
            analyze: 'cross-env ANALYZE=true next build --webpack',
            start: 'next start',
            lint: 'eslint "src/**/*.{ts,tsx}" "scripts/**/*.ts" --max-warnings=0',
            'lint:fix': 'eslint "src/**/*.{ts,tsx}" "scripts/**/*.ts" --fix',
            'check:inventory': 'tsx scripts/inventory.ts',
            'check:orphan': 'tsx scripts/check-orphans.ts',
            'check:unused': 'knip',
            generate: 'tsx scripts/generate-feature.ts',
            remove: 'tsx scripts/remove-feature.ts',
            'type-check': 'tsc --noEmit',
            test: 'vitest',
            'test:ui': 'vitest --ui',
            'test:coverage': 'vitest --coverage',
            format: 'prettier --write "src/**/*.{ts,tsx,json}" "scripts/**/*.ts"',
        },
        dependencies: {
            clsx: '^2.1.1',
            glob: '^13.0.0',
            'isomorphic-dompurify': '^2.35.0',
            'lucide-react': '^0.562.0',
            next: '^16.1.1',
            'next-intl': '^4.7.0',
            react: '^19.2.3',
            'react-dom': '^19.2.3',
            'tailwind-merge': '^3.4.0',
            zod: '^4.3.4',
        },
        devDependencies: {
            '@next/bundle-analyzer': '^16.1.1',
            '@tailwindcss/postcss': '^4.1.18',
            '@testing-library/jest-dom': '^6.9.1',
            '@testing-library/react': '^16.3.1',
            '@testing-library/user-event': '^14.6.1',
            '@types/fs-extra': '^11.0.4',
            '@types/inquirer': '^9.0.9',
            '@types/node': '^22.19.3',
            '@types/react': '^19.0.2',
            '@types/react-dom': '^19.0.2',
            '@vitejs/plugin-react': '^5.1.2',
            '@vitest/coverage-v8': '^4.0.16',
            '@vitest/ui': '^4.0.16',
            autoprefixer: '^10.4.20',
            chalk: '^5.6.2',
            commander: '^14.0.2',
            'cross-env': '^10.1.0',
            eslint: '^9.39.2',
            'eslint-config-next': '^16.1.1',
            'eslint-plugin-import': '^2.32.0',
            'eslint-plugin-unused-imports': '^4.3.0',
            'fs-extra': '^11.3.3',
            inquirer: '^13.1.0',
            jsdom: '^27.4.0',
            knip: '^5.78.0',
            'lint-staged': '^16.2.7',
            msw: '^2.12.7',
            postcss: '^8.4.49',
            prettier: '^3.7.4',
            tailwindcss: '^4.1.18',
            tsx: '^4.21.0',
            typescript: '^5.9.3',
            vitest: '^4.0.16',
        },
        engines: {
            node: '>=18.0.0',
            npm: '>=9.0.0',
        },
    }

    await fs.writeJSON(path.join(TEMPLATE_DIR, 'package.json'), templatePackageJson, { spaces: 2 })

    // Create template README
    const templateReadme = `# PLACEHOLDER_APP_NAME_PASCAL

PLACEHOLDER_DESCRIPTION

## Quick Start

\`\`\`bash
npm install
npm run dev
\`\`\`

## Documentation

See [README.md](./README.md) for full documentation.

## License

MIT © PLACEHOLDER_AUTHOR PLACEHOLDER_YEAR
`

    await fs.writeFile(path.join(TEMPLATE_DIR, 'README.md'), templateReadme)

    // Create .env.example
    const envExample = `# Image domains allowed in CSP
NEXT_PUBLIC_ALLOWED_IMAGE_DOMAINS=https://example.com,https://cdn.example.com
`

    await fs.writeFile(path.join(TEMPLATE_DIR, '.env.example'), envExample)

    console.log(chalk.green('\n✅ Template directory prepared!'))
    console.log(chalk.dim('\nNext steps:'))
    console.log(chalk.dim('  1. Clean business-specific code from template/'))
    console.log(chalk.dim('  2. Add example feature to template/'))
    console.log(chalk.dim('  3. Test CLI: npm link'))
    console.log(chalk.dim('  4. Test: npx enterprise-react-boilerplate test-app\n'))
}

main().catch(console.error)
