# Enterprise React Boilerplate CLI Guide

Complete guide for setting up, testing, and publishing the CLI package.

## 📦 What Is This?

This project is an npm CLI package that generates production-grade Next.js applications with enterprise architecture. Users can create new projects with:

```bash
npx enterprise-react-boilerplate my-app
# or
npx create-enterprise-react my-app
```

## 🏗️ Structure

```
enterprise-react-boilerplate/
├── bin/
│   └── cli.js              # CLI executable entry point
├── template/               # Clean boilerplate template
│   ├── src/                # Application source
│   ├── scripts/            # Feature generators
│   ├── package.json        # Template with PLACEHOLDER_* variables
│   └── README.md           # Template README
├── package.json            # CLI package config (with "bin" field)
└── README.md               # Main documentation
```

## 🚀 Setup Steps

### 1. Prepare Template Directory

```bash
npm run prepare:template
```

This creates `template/` directory with:
- Current project files (excluding node_modules, .git, etc.)
- Template `package.json` with `PLACEHOLDER_*` variables
- Template `README.md` with placeholders

### 2. Clean Template (Manual)

After running `prepare:template`, clean the `template/` directory:

**Remove business-specific code:**
- `template/src/features/catalog/` (products, product-detail)
- `template/src/features/auth/` (login)
- `template/src/features/marketing/` (home)
- `template/src/app/[locale]/login/`
- `template/src/app/[locale]/products/`
- `template/src/app/api/bff/auth/`
- `template/src/app/api/bff/products/`
- `template/src/app/api/bff/categories/`
- `template/coverage/` (if exists)

**Create example feature:**
- `template/src/features/example/welcome/` with:
  - Basic page component
  - Manifest
  - i18n files
  - Simple capability example

**Update:**
- `template/src/features/registry.ts` - Only include example feature
- `template/src/app/[locale]/page.tsx` - Use example feature
- `template/README.md` - Boilerplate-focused documentation

### 3. Test Locally

#### Option A: Using `npm link` (Recommended)

Makes CLI available globally on your machine:

```bash
# From project directory
npm link

# Test from anywhere
cd ~/Desktop
npx enterprise-react-boilerplate test-app

# Unlink when done (optional)
npm unlink -g enterprise-react-boilerplate
```

#### Option B: Direct Execution

```bash
# From project root
node bin/cli.js my-app
```

#### Option C: Using npm pack

Test the actual package structure:

```bash
# Create package tarball
npm pack

# Install globally
npm install -g ./enterprise-react-boilerplate-1.0.0.tgz

# Test
npx enterprise-react-boilerplate my-app

# Uninstall when done
npm uninstall -g enterprise-react-boilerplate
```

### 4. Publish to npm

```bash
# Run checks first
npm run lint
npm run type-check

# Update version
npm version patch  # or minor, major

# Publish
npm publish
```

After publishing, anyone can use:
```bash
npx enterprise-react-boilerplate my-app
```

## 🔧 How It Works

1. **User runs**: `npx enterprise-react-boilerplate my-app`
2. **CLI prompts**: App name, author, description
3. **CLI copies**: `template/` → `my-app/`
4. **CLI replaces**: `PLACEHOLDER_*` variables in all files
5. **CLI initializes**: Git repository (optional)
6. **User runs**: `cd my-app && npm install && npm run dev`

## 📝 Placeholder Variables

The CLI automatically replaces these in template files:

- `PLACEHOLDER_APP_NAME` → `my-app` (kebab-case)
- `PLACEHOLDER_APP_NAME_PASCAL` → `MyApp` (PascalCase)
- `PLACEHOLDER_AUTHOR` → User input
- `PLACEHOLDER_DESCRIPTION` → User input
- `PLACEHOLDER_YEAR` → Current year (e.g., `2024`)

## 📦 Package Configuration

### `package.json` `bin` Field

```json
{
  "bin": {
    "enterprise-react-boilerplate": "./bin/cli.js",
    "create-enterprise-react": "./bin/cli.js"
  }
}
```

This creates two commands that point to the same CLI script.

### `files` Field

Controls what gets published to npm:

```json
{
  "files": [
    "bin",
    "template",
    "README.md",
    "LICENSE"
  ]
}
```

Only these files/directories are included in the published package.

## 🌐 Usage (After Publishing)

Once published, users can create new projects from anywhere:

```bash
# Create new project
npx enterprise-react-boilerplate my-awesome-app

# Or use alias
npx create-enterprise-react my-awesome-app

# Navigate and install
cd my-awesome-app
npm install

# Start development
npm run dev
```

## 🔍 Verification

After `npm link`, verify it's working:

```bash
# Check if linked
npm list -g --depth=0 | grep enterprise-react-boilerplate

# Check symlink location
which enterprise-react-boilerplate

# Test from different directory
cd ~/Desktop && npx enterprise-react-boilerplate test-app
```

## 🐛 Troubleshooting

**If `npx` doesn't find the command after `npm link`:**

1. Check Node version: `node --version` (should be >= 18)
2. Check npm version: `npm --version` (should be >= 9)
3. Try: `npm link --force`
4. Check PATH: `echo $PATH` (should include npm global bin directory)
5. Verify `bin/cli.js` has executable permissions: `chmod +x bin/cli.js`

**If template files aren't found:**

- Ensure `template/` directory exists
- Run `npm run prepare:template` to create it
- Check that `template/` is included in `package.json` `files` field

## 📋 Development Workflow

1. **Edit template**: Make changes in `template/` directory
2. **Test locally**: `npm link` then `npx enterprise-react-boilerplate test-app`
3. **Update version**: Bump version in `package.json` (follow semver)
4. **Publish**: `npm publish`

## ⚠️ Important Notes

- **Template must be clean** - No business-specific code, only architecture examples
- **Keep one example** - Show the architecture pattern with a simple feature
- **Test locally first** - Always use `npm link` before publishing
- **Version carefully** - Follow semver for CLI updates
- **No symlinks in template** - npm packages don't preserve symlinks, use actual files

## 🔗 Links

- **npm package**: `enterprise-react-boilerplate` (after publishing)
- **Repository**: https://github.com/rabinbhandari/enterprise-react-architecture
- **Commands**: 
  - `npx enterprise-react-boilerplate <app-name>`
  - `npx create-enterprise-react <app-name>`

## ✅ Checklist Before Publishing

- [ ] Template directory is clean (no business code)
- [ ] Example feature demonstrates architecture
- [ ] All `PLACEHOLDER_*` variables are in place
- [ ] Tested locally with `npm link`
- [ ] Version bumped appropriately
- [ ] README updated with usage instructions
- [ ] `.npmignore` excludes unnecessary files
- [ ] `package.json` `files` field is correct
