# Enterprise Project Rules & Architecture Standards

These rules are strict, automated where possible, and designed to ensure long-term maintainability, team autonomy, and zero regression.

## 1. Architectural Integrity

*   **Registry is Source of Truth**: `src/features/registry.ts` is the single point that decides what is live. If a feature exists but is not in the registry, it is dead code.
*   **"Delete-a-Folder" Principle**: You must be able to remove any feature/capability by deleting its folder and removing one line in `registry.ts`. No remnants should be left elsewhere.
*   **Strict Import Boundaries**:
    *   **Allowed**: `app` -> `features` (manifests only), `core`, `shared`.
    *   **Allowed**: `features` -> `core`, `shared`, and **files within the same feature** (Relative imports `./components/Foo`).
    *   **FORBIDDEN**: `features` -> `other features` (Coupling).
    *   **FORBIDDEN**: `core/shared` -> `features` (Circular Dependency).
*   **Manifest Public Surface**: Features and Capabilities expose ONLY `manifest.ts` and `index.ts`. All other implementation details (`internal/*.ts`) are private.

## 2. Capabilities & Slots

*   **Slot-Based Actions**: Actions (like "Delete Product") are not hardcoded buttons. They are **Capability Modules** that register themselves into a slot (e.g., `rowActions[]`).
*   **Explicit Versioning**: `v1` and `v2` UI components coexist. The Registry selects which is active. Unused versions are detected as "orphans" by tooling.

## 3. Data Flow & Networking

*   **BFF-Only Networking**: The browser NEVER calls external APIs directly. It only calls `/api/bff/*`. All upstream communication happens server-side.
*   **Central API Client**: One client handles everything:
    *   Standard headers (Accept, X-Request-ID, X-App-Version).
    *   Auth placeholder / User Context injection.
    *   Safe Retry logic.
    *   Standardized Error Normalization.
*   **DTO Validation Boundary**: API responses are validated (Zod) and normalized at the edge. DTOs are mapped to ViewModels immediately. API shapes DO NOT leak into UI components.

## 4. Performance & Rendering

*   **SSR-First**: Server Components are the default. Client "Islands" are used only for interactivity.
*   **No Render Storms**: Optimize state. Avoid mega-contexts. Keep props stable. Use `memo()` only on leaf list items or expensive charts.

## 5. Domain Modeling

*   **Feature-Owned Types**: Types, DTOs, and ViewModels live INSIDE the feature folder. Shared types are only for truly generic utilities (like `PaginatedResult<T>`).
*   **i18n Namespace**: Owned by features (`features/catalog/i18n/en.json`). Core handles common strings (`core/i18n/en.json`).

## 6. Error Handling & Observability

*   **Single Error Model**: All exceptions are normalized into `StandardAppError`.
*   **Boundaries**: Global and Route-level Error Boundaries catch unanticipated crashes.
*   **Observability**: Structured logs (JSON) + Correlation IDs are strictly enforced in Core.

## 7. Developer Workflow

*   **Quality Guardrails**: CI blocks PRs on: Linting, Boundary Checks, Unused Exports, and Orphan Checks.
*   **Generators Mandatory**: New features/capabilities MUST be created via `npm run generate` to ensure folder structure consistency.
