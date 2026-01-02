# Enterprise Access Control (RBAC) Design

This document outlines a database-agnostic **Role-Based Access Control (RBAC)** architecture. It borrows concepts from fine-grained graph permissions but applies them purely within the application layer (Domain/BFF).

## 1. The Authorization Model

We define three core concepts: **Actions**, **Resources**, and **Scope**.

### A. Taxonomy
*   **Role**: A collection of permissions (e.g., `Admin`, `Staff`, `Customer`).
*   **Permission**: A capability string in the format `resource:action` (e.g., `order:read`, `product:create`).
*   **Scope (The "Fine-Grained" Part)**: A rule defining *which* data instances a permission applies to.

---

## 2. Role Definitions

### `Admin`
*   **Scope**: `GLOBAL` (Access everything)
*   **Permissions**: `*` (All permissions)

### `Staff`
*   **Scope**: `GLOBAL` (Can see all operational data)
*   **Permissions**:
    *   `product:read`, `product:create`, `product:update`
    *   `order:read`, `order:update` (Note: No `delete`)
    *   `invoice:read`
*   **Restrictions**: field-level masking (e.g., `wholesaleCost`) handled by the **transformer layer**.

### `Customer`
*   **Scope**: `OWN` (Can only access data linked to their User ID)
*   **Permissions**:
    *   `product:read` (Scope: `GLOBAL` - public catalog)
    *   `order:read`, `order:create` (Scope: `OWN`)
    *   `review:create`, `review:update` (Scope: `OWN`)

---

## 3. Defining "Ownership"

"Ownership" is not magic; it must be explicitly defined for each resource type in your database schema.

| Resource Type | Owner ID Field | Logic Strategy |
| :--- | :--- | :--- |
| **Order** | `userId` | Standard. `order.userId === currentUser.id` |
| **Review** | `authorId` | Standard. `review.authorId === currentUser.id` |
| **Profile** | `id` | Identity. `profile.id === currentUser.id` |
| **KPI Data** | `N/A` | **No Owner**. Only roles with `GLOBAL` scope can access these. |

---

## 4. Implementation Pattern

We implement access control in the **BFF / Domain Layer** using a `PolicyGuard`. This ensures the logic works whether you use SQL, NoSQL, or Graph.

### Step 1: User Context
Every request must be hydrated with a standard context object.

```typescript
type UserContext = {
    id: string
    role: 'admin' | 'staff' | 'customer'
}
```

### Step 2: Policy Configuration
Define permissions as a static configuration or simple logic.

```typescript
const PERMISSIONS = {
    staff: {
        can: ['product:*', 'order:read', 'order:update', 'invoice:read'],
        cannot: ['order:delete', 'invoice:delete', 'kpi:read']
    },
    customer: {
        can: ['product:read', 'order:read', 'order:create', 'review:*'],
        scope: 'OWN' // Enforce ownership verification
    }
}
```

### Step 3: Authorization Middleware (The Guard)
Before executing business logic, check authorization.

```typescript
/**
 * Generic Guard Function
 * @throws {ForbiddenError} if access is denied
 */
function ensureAccess(user: UserContext, resource: string, action: string, resourceOwnerId?: string) {
    // 1. Admin Override (God Mode)
    if (user.role === 'admin') return;

    // 2. Check Role Permissions
    const roleRules = PERMISSIONS[user.role];
    const permission = `${resource}:${action}`;
    const broadPermission = `${resource}:*`;

    // Special Check: Does the user explicitly have this permission?
    const hasPermission = roleRules.can.includes(permission) || roleRules.can.includes(broadPermission);

    // Special Check: Is this permission explicitly FORBIDDEN? (e.g., Staff cannot read KPIs)
    const isForbidden = roleRules.cannot?.includes(permission);

    if (!hasPermission || isForbidden) {
        throw new ForbiddenError(`Role ${user.role} cannot perform ${action} on ${resource}`);
    }

    // 3. Check Ownership Scope (The "Fine-Grained" part)
    if (roleRules.scope === 'OWN') {
        // CASE A: List View (e.g. GET /orders)
        // If no specific resource ID is provided, the controller MUST filter the DB query by userId.
        if (!resourceOwnerId) {
             return; 
        }
        
        // CASE B: Detail View / Action (e.g. GET /orders/123)
        // We verify that the resource actually belongs to the user.
        if (resourceOwnerId !== user.id) {
            throw new ForbiddenError("You do not own this resource");
        }
    }
    
    // NOTE: KPI Resources have no 'ownerId'. 
    // Therefore, roles with scope='OWN' (Customer) can never access them unless we explicitly 
    // add 'kpi:read' to their 'can' list AND skip the ownership check for that specific resource.
    // In our config, Customer does NOT have 'kpi:read', so they are blocked at Step 2.
}
```

---

## 5. Handling KPI Data (Admin Only)

KPIs are a special case because they are aggregate data (e.g., "Total Revenue"). They don't belong to a user.

### Configuration
*   **Resource**: `kpi`
*   **Action**: `read`
*   **Permissions**: Only `Admin` has `*` (which includes `kpi:read`). `Staff` and `Customer` lists do not include it.

### Runtime Check
**Request**: `GET /admin/stats` (User: Staff)
**Check**: `ensureAccess(staffUser, 'kpi', 'read')`
1.  Check `staff` permissions.
2.  Does `staff.can` include `kpi:read`? -> **NO**.
3.  **Result**: Access Denied.

---

## 6. Field-Level Security (Response Masking)

For field restrictions (like `wholesaleCost` for staff), we use the **DTO Transformation** pattern at the API edge.

```typescript
function transformProduct(product: Product, role: string) {
    if (role === 'staff' || role === 'customer') {
        const { wholesaleCost, supplierInfo, ...publicData } = product;
        return publicData;
    }
    return product; // Admin sees everything
}
```
