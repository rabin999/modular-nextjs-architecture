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

/**
 * Main entry point for the CLI.
 * Handles user inputs, directory creation, and project scaffolding.
 */
async function main() {
    console.log(chalk.bold.blue('🚀 Enterprise React Boilerplate'))
    console.log(chalk.dim('Production-grade Next.js architecture\n'))

    const appName = process.argv[2]

    if (!appName) {
        console.log(chalk.red('❌ Please provide an app name:'))
        console.log(chalk.dim('   npx enterprise-react-boilerplate <app-name>\n'))
        process.exit(1)
    }

    if (!/^[a-z0-9-]+$/.test(appName)) {
        console.log(chalk.red('❌ App name must be lowercase, alphanumeric, and may contain hyphens'))
        process.exit(1)
    }

    const targetDir = resolve(process.cwd(), appName)

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

    const author = await input({
        message: 'Author name:',
        default: 'Your Name',
    })

    const description = await input({
        message: 'Project description:',
        default: 'Enterprise React application built with Next.js',
    })

    const i18n = await confirm({
        message: 'Enable internationalization (i18n)?',
        default: false,
    })

    console.log(chalk.dim(`\nCreating project "${appName}"...`))

    try {
        await fs.copy(TEMPLATE_DIR, targetDir, {
            filter: (src) => {
                const name = src.split(/[/\\]/).pop()
                return !['node_modules', '.git', '.next', 'coverage', '.DS_Store'].includes(name)
            },
        })

        await replacePlaceholders(targetDir, {
            APP_NAME: appName,
            APP_NAME_PASCAL: toPascalCase(appName),
            AUTHOR: author,
            DESCRIPTION: description,
            YEAR: new Date().getFullYear().toString(),
        })

        if (!i18n) {
            await configureSingleLocale(targetDir)
        }

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

/**
 * Converts a kebab-case string to PascalCase.
 * @param {string} str - The input string.
 * @returns {string} The PascalCase string.
 */
function toPascalCase(str) {
    return str
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')
}

/**
 * Configures the project for a single locale (English).
 * Modifies config files and removes unused localization files.
 * @param {string} dir - The project directory.
 */
async function configureSingleLocale(dir) {
    try {
        const configFile = join(dir, 'src/core/i18n/config.ts')
        const routingFile = join(dir, 'src/core/i18n/routing.ts')

        if (await fs.pathExists(configFile)) {
            let configContent = await fs.readFile(configFile, 'utf-8')
            configContent = configContent.replace(
                /export const LOCALES = \['en', 'ar'\] as const/,
                "export const LOCALES = ['en'] as const"
            )
            await fs.writeFile(configFile, configContent)
        }

        if (await fs.pathExists(routingFile)) {
            let routingContent = await fs.readFile(routingFile, 'utf-8')
            routingContent = routingContent.replace(
                /export const routing = defineRouting\({/,
                "export const routing = defineRouting({\n    localePrefix: 'never',"
            )
            await fs.writeFile(routingFile, routingContent)
        }

        const messagesDir = join(dir, 'messages')
        const arFile = join(messagesDir, 'ar.json')
        if (await fs.pathExists(arFile)) {
            await fs.remove(arFile)
        }
    } catch (error) {
        console.warn(chalk.yellow('⚠️ Failed to configure single locale:'), error.message)
    }
}

/**
 * Replaces placeholders in all files within a directory.
 * @param {string} dir - The directory to search.
 * @param {Record<string, string>} replacements - Key-value pairs of placeholders and their replacements.
 */
async function replacePlaceholders(dir, replacements) {
    const files = await getFilesRecursive(dir)

    for (const file of files) {
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

            for (const [key, value] of Object.entries(replacements)) {
                const regex = new RegExp(`PLACEHOLDER_${key}`, 'g')
                content = content.replace(regex, value)
            }

            await fs.writeFile(file, content, 'utf-8')
        } catch (error) {
            continue
        }
    }
}

/**
 * Recursively gets all files in a directory.
 * @param {string} dir - The directory path.
 * @returns {Promise<string[]>} List of absolute file paths.
 */
async function getFilesRecursive(dir) {
    const files = []
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
        const fullPath = join(dir, entry.name)

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
