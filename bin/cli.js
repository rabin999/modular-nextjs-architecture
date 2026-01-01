#!/usr/bin/env node

/**
 * Enterprise React Boilerplate CLI
 * Usage: npx enterprise-react-boilerplate <app-name>
 */

import { fileURLToPath } from 'url'
import { dirname, join, resolve } from 'path'
import fs from 'fs-extra'
import { execSync } from 'child_process'
import chalk from 'chalk'
import { input, confirm } from '@inquirer/prompts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const CLI_ROOT = resolve(__dirname, '..')
const TEMPLATE_DIR = join(CLI_ROOT, 'template')

async function main() {
    console.log(chalk.bold.blue('🚀 Enterprise React Boilerplate'))
    console.log(chalk.dim('Production-grade Next.js architecture\n'))

    // Get app name from command line args
    const appName = process.argv[2]

    if (!appName) {
        console.log(chalk.red('❌ Please provide an app name:'))
        console.log(chalk.dim('   npx enterprise-react-boilerplate <app-name>\n'))
        process.exit(1)
    }

    // Validate app name
    if (!/^[a-z0-9-]+$/.test(appName)) {
        console.log(chalk.red('❌ App name must be lowercase, alphanumeric, and may contain hyphens'))
        process.exit(1)
    }

    const targetDir = resolve(process.cwd(), appName)

    // Check if directory exists
    if (fs.existsSync(targetDir)) {
        const overwrite = await confirm({
            message: `Directory "${appName}" already exists. Overwrite?`,
            default: false,
        })

        if (!overwrite) {
            console.log(chalk.dim('Cancelled.'))
            process.exit(0)
        }

        fs.removeSync(targetDir)
    }

    // Get additional info
    const author = await input({
        message: 'Author name:',
        default: 'Your Name',
    })

    const description = await input({
        message: 'Project description:',
        default: 'Enterprise React application built with Next.js',
    })

    console.log(chalk.dim(`\nCreating project "${appName}"...`))

    try {
        // Copy template
        await fs.copy(TEMPLATE_DIR, targetDir, {
            filter: (src) => {
                // Skip node_modules, .git, .next, coverage
                const name = src.split(/[/\\]/).pop()
                return !['node_modules', '.git', '.next', 'coverage', '.DS_Store'].includes(name)
            },
        })

        // Replace placeholders
        await replacePlaceholders(targetDir, {
            APP_NAME: appName,
            APP_NAME_PASCAL: toPascalCase(appName),
            AUTHOR: author,
            DESCRIPTION: description,
            YEAR: new Date().getFullYear().toString(),
        })

        // Initialize git (optional)
        const initGit = await confirm({
            message: 'Initialize git repository?',
            default: true,
        })

        if (initGit) {
            process.chdir(targetDir)
            execSync('git init', { stdio: 'ignore' })
            execSync('git add -A', { stdio: 'ignore' })
            execSync('git commit -m "Initial commit from enterprise-react-boilerplate"', {
                stdio: 'ignore',
            })
        }

        console.log(chalk.green(`\n✅ Project "${appName}" created successfully!`))
        console.log(chalk.dim('\nNext steps:'))
        console.log(chalk.cyan(`  cd ${appName}`))
        console.log(chalk.cyan('  npm install'))
        console.log(chalk.cyan('  npm run dev\n'))
    } catch (error) {
        console.error(chalk.red('\n❌ Error creating project:'), error.message)
        process.exit(1)
    }
}

function toPascalCase(str) {
    return str
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')
}

async function replacePlaceholders(dir, replacements) {
    const files = await getFilesRecursive(dir)

    for (const file of files) {
        // Skip binary files and node_modules
        if (
            file.includes('node_modules') ||
            file.endsWith('.png') ||
            file.endsWith('.jpg') ||
            file.endsWith('.jpeg') ||
            file.endsWith('.gif') ||
            file.endsWith('.ico') ||
            file.endsWith('.svg') ||
            file.endsWith('.woff') ||
            file.endsWith('.woff2')
        ) {
            continue
        }

        try {
            let content = await fs.readFile(file, 'utf-8')

            // Replace all placeholders
            for (const [key, value] of Object.entries(replacements)) {
                const regex = new RegExp(`PLACEHOLDER_${key}`, 'g')
                content = content.replace(regex, value)
            }

            await fs.writeFile(file, content, 'utf-8')
        } catch (error) {
            // Skip files that can't be read as text
            continue
        }
    }
}

async function getFilesRecursive(dir) {
    const files = []
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
        const fullPath = join(dir, entry.name)

        // Skip certain directories
        if (
            entry.isDirectory() &&
            (entry.name === 'node_modules' ||
                entry.name === '.git' ||
                entry.name === '.next' ||
                entry.name === 'coverage')
        ) {
            continue
        }

        if (entry.isDirectory()) {
            files.push(...(await getFilesRecursive(fullPath)))
        } else {
            files.push(fullPath)
        }
    }

    return files
}

main().catch((error) => {
    console.error(chalk.red('Fatal error:'), error)
    process.exit(1)
})
