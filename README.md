<div align="center">

# 🏛️ Enterprise React Platform

**Production-grade Next.js architecture with lazy-loaded registry, security hardening, and feature isolation.**

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-52%20Passing-brightgreen)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](./LICENSE)

</div>

---

## 📖 Documentation

*   [**API Response Standard**](./docs/API_RESPONSE_STANDARD.md): Unified structure for Success, Errors, and Pagination.
*   [**Domain Logic Pattern**](./docs/DOMAIN_LOGIC_PATTERN.md): How to write pure business logic (Functional Core) separate from infrastructure.
*   [**CLI & Generators Guide**](./docs/CLI_GUIDE.md): Commands for generating features, capabilities, and managing the registry.
*   [**Project Rules & Architecture**](./docs/PROJECT_RULES.md): The "Constitution" of the project. Strict rules on imports, versioning, and structure.

---

## 🚀 Key Features

- **Zero-Cost Registry**: lazy-loaded feature manifests
- **Feature Isolation**: strict module boundaries enforced by ESLint
- **Security-First**: CSP, HSTS, Sanitization, and HPP protection
- **BFF Pattern**: Backend-for-Frontend API layer
- **Enterprise Tooling**: Generators, Inventory Checks, Dead Code Detection

---

## 🛠 Developer Workflow

### Installation
```bash
npm install
npm run dev
```

### Generators
Scaffold features and capabilities consistent with the architecture.
```bash
npm run generate
```

### Testing
```bash
npm test              # Unit & Integration
npm run test:e2e      # Playwright E2E
```

### Analysis
```bash
npm run analyze       # Bundle size
npm run check:unused  # Knip dead code check
```
