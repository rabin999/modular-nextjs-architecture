<div align="center">

# 🏛️ Enterprise React Platform

**Production-grade Next.js architecture with lazy-loaded registry, security hardening, and feature isolation.**

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-52%20Passing-brightgreen)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](./LICENSE)

</div>

---

## 📖 Table of Contents

- [What Makes This Different](#-what-makes-this-different)
- [Architecture Pillars](#-architecture-pillars)
- [Project Structure](#-project-structure)
- [Developer Workflow](#-developer-workflow)
- [Testing Strategy](#-testing-strategy)
- [Architecture Enforcement](#️-architecture-enforcement)
- [Security Features](#-security-features)
- [Performance](#-performance-optimizations)
- [Scripts Reference](#-scripts-reference)
- [Custom Scripts](#-custom-scripts)
- [Key Files](#-key-files-reference)

---

> 💡 **Philosophy**: Code should be easy to delete, not just easy to write.

A battle-tested, scalable architecture designed for **long-term maintainability** and **team autonomy**.

---


## 🚀 What Makes This Different

### Zero-Cost Registry (Lazy Loading)
Unlike traditional architectures where importing the registry loads all features, our **lazy-loaded registry** ensures:
- **0kb initial overhead**: Feature manifests are loaded on-demand
- **Infinite scalability**: Add 500 features without impacting bundle size
- **True code splitting**: Each feature is a separate chunk

### Security-First Design
Production-ready security out of the box:
- **CSP (Content Security Policy)**: Strict XSS prevention with dynamic image domain configuration
- **HSTS**: Enforced HTTPS with preload
- **HPP Protection**: HTTP Parameter Pollution guards on all inputs
- **XSS Sanitization**: OWASP-recommended DOMPurify integration
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy

### BFF (Backend-for-Frontend) Pattern
We use the **BFF pattern** to create a dedicated API layer between the client and external services.

**What is BFF?**
- **Backend-for-Frontend**: A server-side API layer tailored specifically for your frontend needs
- **Purpose**: Aggregates, transforms, and secures calls to upstream services (databases, third-party APIs)
- **Location**: `src/app/api/bff/*` (Next.js API routes)

**Why BFF?**
1. **Security**: Keeps API keys and secrets server-side, never exposed to the browser
2. **Flexibility**: Transform external API responses to match your UI needs
3. **Performance**: Aggregate multiple API calls into one, reducing client round-trips
4. **Stability**: Insulate frontend from breaking changes in upstream APIs

**Our Implementation** (Handler Delegate Pattern):
- **Feature Ownership**: Business logic lives in `src/features/[feature]/api/handler.ts`
- **Zero Merge Conflicts**: Teams work in isolated feature folders
- **Platform Stability**: `src/app/api/bff/*` contains only routing wiring (re-exports handlers)

**Example**:
```typescript
// src/app/api/bff/products/route.ts (Wiring - Platform Team)
export { GET } from '@/features/catalog/products/api/handler'

// src/features/catalog/products/api/handler.ts (Logic - Feature Team)
export async function GET(request: NextRequest) {
    const category = sanitizeString(searchParams.get('category'))
    const result = await apiClient(`${FAKESTORE_API}/products/category/${category}`)
    return NextResponse.json(result)
}
```


---

## 🏗 Architecture Pillars

### 1. Lazy-Loaded Registry
**Location**: `src/features/registry.ts`

The registry is now a **Map of Loaders**, not static imports:
```typescript
export const REGISTRY = {
    features: {
        'catalog-products': () => import('./catalog/products/manifest').then(m => m.catalogManifest),
        // ... more features
    }
}
```

**Benefits**:
- Main bundle contains zero feature code
- Features load only when their routes are accessed
- Switching features on/off has zero performance cost

### 2. Feature Isolation (The "Folder = Module" Rule)
Every feature in `src/features/` is **100% self-contained**:

```
src/features/catalog/
├── types.ts              # Domain types (Product, Category)
├── products/
│   ├── manifest.ts       # Public contract
│   ├── page/             # UI components
│   ├── api/
│   │   └── handler.ts    # ✅ Business logic HERE (not in app/api)
│   └── i18n/             # Translations
```

**Deletion Test**: Remove `src/features/catalog` → Only `registry.ts` needs updating.

### 3. Capabilities as Plugins
Small actions (Edit, Delete, Share) are **slot-based capabilities**:
- **Versioning**: Ship V1 and V2 side-by-side, switch with one line
- **Lazy Loaded**: Capabilities are also dynamically imported
- **Slot Injection**: Pages define slots, registry fills them

### 4. Core Platform (`src/core`)
Shared infrastructure that features consume:

```
src/core/
├── types/
│   └── registry.ts       # FeatureManifest, CapabilityManifest contracts
├── api/
│   ├── client.ts         # Standardized fetch with Zod validation
│   └── endpoints.ts      # Environment-aware API URLs
├── security/
│   └── guard.ts          # HPP protection, XSS sanitization
├── i18n/                 # next-intl configuration
└── errors/               # Normalized error handling
```

### 5. Type Safety (No `any`)
Strict TypeScript with domain-specific types:
- **Product**: Defined in `src/features/catalog/types.ts` (co-located with feature)
- **Manifests**: Defined in `src/core/types/registry.ts` (platform contract)
- **Rule**: Domain types live in features, platform types live in core

---

## 📂 Project Structure

```
src/
├── core/                      # Platform (Contracts, Security, i18n)
│   ├── types/registry.ts      # FeatureManifest, CapabilityManifest
│   ├── api/client.ts          # Zod-validated fetch wrapper
│   ├── security/guard.ts      # HPP + XSS protection
│   └── i18n/                  # Internationalization setup
│
├── features/                  # Business Logic (Isolated Modules)
│   ├── registry.ts            # 🧠 Lazy-loaded feature map
│   │
│   ├── catalog/
│   │   ├── types.ts           # Product, Category (domain types)
│   │   ├── products/
│   │   │   ├── manifest.ts
│   │   │   ├── page/ProductsPage.tsx
│   │   │   ├── api/handler.ts # ✅ Feature owns API logic
│   │   │   └── i18n/
│   │   │
│   │   └── product-detail/
│   │       ├── capabilities/
│   │       │   └── editProduct/
│   │       │       ├── manifest.ts
│   │       │       ├── ui/v1/  # Legacy
│   │       │       └── ui/v2/  # Current
│   │       └── manifest.ts
│   │
│   └── auth/
│       └── login/
│           ├── manifest.ts
│           └── page/LoginPage.tsx
│
├── app/                       # Next.js App Router (Wiring Only)
│   ├── [locale]/
│   │   ├── page.tsx           # Loads features from registry
│   │   └── products/page.tsx
│   └── api/bff/
│       └── products/route.ts  # ✅ Delegates to feature handler
│
├── shared/                    # Dumb UI Components (Button, Card)
│   └── ui/
│
└── middleware.ts              # Security headers + CSP
```

---

## 🛠 Developer Workflow

### Adding a New Feature
Use the **generator** for consistency:
```bash
npm run generate
```
Select "Feature", provide a name (auto-converted to kebab-case), and the generator:
1. Creates folder structure
2. Scaffolds manifest with lazy imports
3. Updates `registry.ts`

### Adding a Capability
```bash
npm run generate
```
Select "Capability", search for the parent feature, and specify the slot (e.g., `rowActions`).

### Versioning a Component
1. Create `ui/v2/MyComponent.tsx`
2. Add `myCapabilityV2` to manifest
3. Update registry to use V2
4. Delete V1 when stable

### Checking System Health
```bash
npm run check:inventory    # List active features/capabilities
npm run check:unused       # Find dead code (Knip)
npm run analyze            # Bundle size analysis
```

---

## 🧪 Testing Strategy

We follow the **testing pyramid** approach with emphasis on integration tests, as recommended by [Next.js testing guide](https://nextjs.org/docs/app/guides/testing).

### Testing Pyramid

```
        /\
       /E2E\          ← Critical user journeys (5-10%)
      /------\
     /  Inte- \       ← Feature workflows (60-70%)
    / gration \
   /------------\
  /    Unit      \    ← Utilities, guards, helpers (20-30%)
 /----------------\
```

### 1. Unit Tests (Vitest)
**Purpose**: Test isolated utilities, security guards, and shared components.

**Tools**: [Vitest](https://vitest.dev/) (recommended by Next.js for unit testing)

**What to Test**:
- Security utilities (`src/core/security/guard.ts`)
- Shared UI components (`src/shared/ui/*`)
- Utility functions (`src/shared/utils/*`)
- Type transformations

**Example Structure**:
```
src/core/security/
├── guard.ts
└── __tests__/
    └── guard.test.ts
```

**Example Test**:
```typescript
// src/core/security/__tests__/guard.test.ts
import { describe, it, expect } from 'vitest'
import { sanitizeString, ensureSingle } from '../guard'

describe('sanitizeString', () => {
  it('should remove XSS attempts', () => {
    const dirty = '<script>alert("xss")</script>Hello'
    expect(sanitizeString(dirty)).toBe('Hello')
  })
})

describe('ensureSingle', () => {
  it('should return last value for array', () => {
    expect(ensureSingle(['a', 'b', 'c'])).toBe('c')
  })
})
```

### 2. Integration Tests (Vitest + Testing Library)
**Purpose**: Test feature workflows and component interactions.

**Tools**: 
- [Vitest](https://vitest.dev/)
- [@testing-library/react](https://testing-library.com/react)
- [MSW](https://mswjs.io/) for API mocking

**What to Test**:
- Feature pages with registry integration
- User interactions (click, type, submit)
- API calls and data flow
- Capability injection into slots

**Example Structure**:
```
src/features/catalog/products/
├── page/ProductsPage.tsx
└── __tests__/
    └── ProductsPage.integration.test.tsx
```

**Example Test**:
```typescript
// src/features/catalog/products/__tests__/ProductsPage.integration.test.tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ProductsPage } from '../page/ProductsPage'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

const server = setupServer(
  http.get('/api/bff/products', () => {
    return HttpResponse.json({
      ok: true,
      data: [{ id: 1, title: 'Test Product', price: 99 }]
    })
  })
)

beforeEach(() => server.listen())

describe('ProductsPage Integration', () => {
  it('should load and display products from API', async () => {
    render(<ProductsPage searchParams={Promise.resolve({})} />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument()
    })
  })
})
```

### 3. End-to-End Tests (Playwright)
**Purpose**: Test critical user journeys in a real browser.

**Tools**: [Playwright](https://playwright.dev/) (recommended by Next.js for E2E)

**What to Test**:
- Authentication flow (login → dashboard)
- Product journey (list → detail → edit)
- Checkout flow
- Error scenarios

**Example Structure**:
```
e2e/
├── tests/
│   ├── auth.spec.ts
│   ├── products.spec.ts
│   └── smoke.spec.ts
└── fixtures/
    └── test-data.ts
```

**Example Test**:
```typescript
// e2e/tests/products.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Product Journey', () => {
  test('should navigate from list to detail and edit', async ({ page }) => {
    // Navigate to products
    await page.goto('/en/products')
    
    // Click first product
    await page.click('text=Product 1')
    
    // Verify detail page
    await expect(page).toHaveURL(/\/products\/\d+/)
    
    // Click edit button (capability injection test)
    await page.click('button:has-text("Edit")')
    
    // Verify edit modal/page
    await expect(page.locator('form')).toBeVisible()
  })
})
```

### Test Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### Testing Best Practices

1. **Feature Isolation**: Each feature's tests should be self-contained
2. **Mock External APIs**: Use MSW to mock BFF endpoints
3. **Test User Behavior**: Focus on what users do, not implementation details
4. **Avoid Testing Implementation**: Don't test internal state or private methods
5. **Test Accessibility**: Use `getByRole`, `getByLabelText` from Testing Library

### Setup Instructions

**Vitest**:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Playwright**:
```bash
npm init playwright@latest
```

Refer to [Next.js Testing Guide](https://nextjs.org/docs/app/guides/testing) for detailed setup.

---

## 🛡️ Architecture Enforcement

We use **ESLint** to enforce architectural boundaries at lint-time, catching violations before they reach code review.

### The Problem We're Solving

Without enforcement, developers can accidentally:
- Import code from one feature into another (coupling features together)
- Import app-layer code into features (breaking unidirectional flow)
- Import feature code into core/shared (polluting the foundation)

These violations compile fine but create **hidden dependencies** that make features impossible to delete cleanly.

### Our Three-Layer Defense

We use three complementary ESLint strategies:

#### 1. `no-restricted-imports` — Blocking Alias Patterns

**Why**: Catches imports using the `@/` path alias.

**What it blocks**:
```typescript
// ❌ BLOCKED: Feature importing from another feature
// (in src/features/auth/login/page.tsx)
import { ProductCard } from '@/features/catalog/products/ui/ProductCard'

// ✅ ALLOWED: Feature importing from shared
import { Button } from '@/shared/ui/Button'
```

#### 2. `import/no-restricted-paths` — Dynamic Feature Isolation

**Why**: Blocks imports based on **file location**, not just import strings. This enables automatic zone generation.

**How it works**: Our `.eslintrc.cjs` scans the `src/features` folder and automatically creates a restriction zone for each feature. When you add a new feature, it's immediately protected—no manual configuration needed.

**What it blocks**:
```typescript
// ❌ BLOCKED: Feature importing from app layer
// (in src/features/catalog/products/page.tsx)
import { Layout } from '../../app/layout'

// ❌ BLOCKED: Relative path between features
// (in src/features/auth/login/page.tsx)
import { Product } from '../../catalog/types'
```

#### 3. `overrides` — Extra Protection for Core/Shared

**Why**: The foundation layers (`src/core`, `src/shared`) must remain **completely independent**. They cannot know about features or the app layer.

**What it blocks**:
```typescript
// ❌ BLOCKED: Core importing from feature
// (in src/core/api/client.ts)
import { Product } from '@/features/catalog/types'

// ❌ BLOCKED: Shared importing from app
// (in src/shared/ui/Button.tsx)  
import { useRouter } from '@/app/navigation'
```

### The Dependency Flow

```
┌─────────────────────────────────────┐
│   App Layer (src/app)               │  ← Can import from anywhere below
├─────────────────────────────────────┤
│   Features (src/features)           │  ← Can import from Core/Shared only
│                                     │     Cannot import from other features
├─────────────────────────────────────┤
│   Core + Shared                     │  ← Cannot import from above
│   (src/core, src/shared)            │     Must remain dependency-free
└─────────────────────────────────────┘
```

**This ensures**:
- Features can be deleted without breaking other features
- Core utilities work anywhere in the app
- Shared UI components have no business logic dependencies

### Pre-commit Validation (Husky)

Every `git commit` automatically runs:
- **ESLint**: Catches architecture violations
- **Prettier**: Formats code consistently

If any check fails, the commit is blocked. Developers fix issues immediately rather than discovering them in CI.

### Running Checks Manually

```bash
npm run lint              # Check all files
npm run type-check        # TypeScript validation
npm run test              # Run all tests
```


---


## 🔒 Security Features

### 1. Content Security Policy (CSP)
**Dynamic Configuration** via environment variables:
```bash
# .env.local
NEXT_PUBLIC_ALLOWED_IMAGE_DOMAINS=https://cdn.example.com,https://images.example.com
```

Defaults to FakeStore API domains if not set.

### 2. Input Sanitization
Every user input is protected:
```typescript
import { ensureSingle, sanitizeString } from '@/core/security/guard'

// HTTP Parameter Pollution protection
const category = ensureSingle(searchParams.get('category'))

// XSS prevention (DOMPurify)
const clean = sanitizeString(userInput)
```

### 3. Security Headers
Automatically applied via middleware:
- HSTS with preload
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy (disables unused features)

---

## 📊 Performance Optimizations

### Lazy Registry
- **Before**: Registry imports all features → 500kb initial bundle
- **After**: Registry is a map of loaders → 0kb overhead

### Dynamic Imports
All components use `next/dynamic`:
```typescript
const ProductsPage = dynamic(() => import('./page/ProductsPage').then(m => m.ProductsPage))
```

### Bundle Analysis
```bash
npm run analyze
```
Generates detailed reports in `.next/analyze/`.

---

## 🌍 Internationalization

Built on `next-intl` with **lazy message loading**:
- Messages are loaded per-feature from the registry
- Supports RTL (Arabic) and LTR (English)
- Feature-specific translations in `i18n/` folders

---

## 🧪 Testing the Architecture

### Deletion Test
1. Delete `src/features/catalog`
2. Remove import from `registry.ts`
3. Run `npm run build`
4. **Expected**: Clean build, zero orphaned code

### Feature Toggle Test
1. Comment out a feature in `registry.ts`
2. Run `npm run check:inventory`
3. **Expected**: Feature not listed, app still works

### Performance Test
1. Add 50 features to registry
2. Run `npm run analyze`
3. **Expected**: Initial bundle size unchanged

---

## 🎯 Design Principles

### 1. Decoupling Over DRY
Prefer isolated duplication over shared coupling. If deleting a feature requires changes outside its folder, the architecture has failed.

### 2. Explicit Over Implicit
The registry is the single source of truth. No "magic" auto-discovery of features.

### 3. Platform vs. Domain
- **Core**: Platform contracts (types, security, API client)
- **Features**: Domain logic (Product, Checkout, Auth)
- **Shared**: Dumb UI only (no business logic)

### 4. Type Safety
No `any` types. Domain types live with features, platform types live in core.

---

## 🚦 Getting Started

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_ALLOWED_IMAGE_DOMAINS=https://fakestoreapi.com,https://i.pravatar.cc
```

---

## 📝 Scripts Reference

<table>
<tr><th>Category</th><th>Command</th><th>Description</th></tr>

<tr><td rowspan="3"><b>Development</b></td>
<td><code>npm run dev</code></td><td>Start development server with Turbopack hot reload</td></tr>
<tr><td><code>npm run build</code></td><td>Create optimized production build</td></tr>
<tr><td><code>npm start</code></td><td>Run production server</td></tr>

<tr><td rowspan="3"><b>Testing</b></td>
<td><code>npm test</code></td><td>Run all unit and integration tests</td></tr>
<tr><td><code>npm run test:ui</code></td><td>Launch Vitest interactive test runner</td></tr>
<tr><td><code>npm run test:coverage</code></td><td>Generate test coverage report</td></tr>

<tr><td rowspan="2"><b>Code Quality</b></td>
<td><code>npm run lint</code></td><td>Run ESLint with architecture rules</td></tr>
<tr><td><code>npm run type-check</code></td><td>TypeScript compilation check (no emit)</td></tr>

<tr><td rowspan="4"><b>Analysis</b></td>
<td><code>npm run analyze</code></td><td>Generate bundle size visualization</td></tr>
<tr><td><code>npm run check:inventory</code></td><td>List all registered features and capabilities</td></tr>
<tr><td><code>npm run check:orphan</code></td><td>Detect manifests not registered in registry</td></tr>
<tr><td><code>npm run check:unused</code></td><td>Find dead code with Knip</td></tr>

<tr><td><b>Generator</b></td>
<td><code>npm run generate</code></td><td>Scaffold new features or capabilities</td></tr>
</table>

---

## 🔧 Custom Scripts

Our custom scripts in `scripts/` provide architectural tooling:

### `generate-feature.ts`
**Interactive scaffolding tool** that creates new features and capabilities following all conventions.

```bash
npm run generate
```

**What it does:**
- Prompts for feature type (Feature or Capability)
- Auto-converts names to kebab-case
- Creates correct folder structure (`page/`, `api/`, `i18n/`)
- Generates lazy-loaded manifest with correct imports
- Updates `registry.ts` automatically
- Uses `@/core/types/registry` for type imports

**Example output:**
```
src/features/checkout/
├── page/CheckoutPage.tsx
├── i18n/en.json
├── i18n/ar.json
└── manifest.ts
```

---

### `inventory.ts`
**Registry inspection tool** that displays all registered features and capabilities.

```bash
npm run check:inventory
```

**What it shows:**
- All registered features with their IDs
- All registered capabilities with their IDs
- Loader type (lazy-loaded vs static)
- Current UI configuration

**Example output:**
```
✅ Registered Features:
  - catalog-products
    └─ Loader: lazy-loaded ✓

🔌 Registered Capabilities:
  - edit-product
    └─ Loader: lazy-loaded ✓

Total Features: 4
Total Capabilities: 3
```

---

### `check-orphans.ts`
**Orphan detection tool** that finds manifest files not registered in the registry.

```bash
npm run check:orphan
```

**What it does:**
- Scans all `manifest.ts` files in `src/features/`
- Checks if each is referenced in `registry.ts`
- Reports orphans that should be registered or deleted
- Returns exit code 1 if orphans found (CI-friendly)

**Example output:**
```
⚠️  ORPHAN: catalog/old-feature/manifest.ts

✅ Registered: 6
⚠️  Orphans: 1
```

---

## 🛡 Guarantees

| Guarantee | How We Achieve It |
|-----------|-------------------|
| **Safety** | Features are isolated; changes have limited blast radius |
| **Clarity** | Registry is single source of truth for active features |
| **Performance** | Lazy loading ensures 0kb overhead per inactive feature |
| **Security** | Production-grade CSP, HPP, XSS, and header hardening |
| **Maintainability** | Delete features by removing folder + registry entry |
| **Testability** | 52+ tests covering security, capabilities, and pages |

---

## 📚 Key Files Reference

### Core Architecture

| File | Purpose |
|------|---------|
| `src/features/registry.ts` | Central lazy-loaded feature/capability map |
| `src/core/types/registry.ts` | `FeatureManifest` and `CapabilityManifest` type contracts |

### Security Layer

| File | Purpose |
|------|---------|
| `src/core/security/guard.ts` | `sanitizeString()`, `ensureSingle()`, `sanitizeObject()` |
| `src/middleware.ts` | CSP, HSTS, X-Frame-Options, and other security headers |

### Configuration

| File | Purpose |
|------|---------|
| `.eslintrc.cjs` | Dynamic ESLint with auto-discovered feature zones |
| `vitest.config.ts` | Test runner configuration with path aliases |
| `.husky/pre-commit` | Pre-commit hook running lint-staged |
| `.env.example` | Environment variable documentation |

### Developer Tools

| File | Purpose |
|------|---------|
| `scripts/generate-feature.ts` | Interactive feature/capability scaffolding |
| `scripts/inventory.ts` | Registry inspection and feature listing |
| `scripts/check-orphans.ts` | Orphan manifest detection |

---

## 📄 License

MIT

---

<div align="center">

**Enterprise React Platform**

*Built for teams that value long-term maintainability over short-term convenience.*

[![Build](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Tests](https://img.shields.io/badge/tests-52%20passing-brightgreen)]()
[![TypeScript](https://img.shields.io/badge/typescript-strict-blue)]()
[![Architecture](https://img.shields.io/badge/architecture-enforced-purple)]()

</div>

