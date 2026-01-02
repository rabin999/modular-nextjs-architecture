# Domain Logic Pattern: Functional Core, Imperative Shell

This document defines how to implement complex business logic (like commission calculations) cleanly, even when rules depend on dynamic database values.

## The Principle

We separate code into two distinct layers:
1.  **The Core (Pure Domain)**: Functional, mathematical logic. Zero dependencies. Easy to test.
2.  **The Shell (Infrastructure)**: Fetches data (DB/API), calls the Core, and saves the result.

---

## 1. Folder Structure

We organize logic "Domain-First", keeping pure rules separate from the database/API wiring.

```
src/features/billing/
├── domain/                  # 🟢 PURE LOGIC (The "Core")
│   ├── commission.ts        # Pure function: Input -> Output
│   └── commission.test.ts   # Unit tests for the pure function
│
├── api/                     # 🔴 INFRASTRUCTURE (The "Shell")
│   └── handler.ts           # Fetches from DB, calls domain, saves result
│
├── types.ts                 # Shared Types
└── manifest.ts              # Feature contract
```

---

## 2. The Core (Pure Business Logic)

This code lives in `domain/commission.ts`. It creates the "shape" of the required data but does not know where it comes from.

```typescript
// Define the "Contract" for the rules we need
export interface CommissionRules {
    percentageRate: number   // e.g. 0.14
    fixedPlatformFee: number // e.g. 20
    fixedServiceFee: number  // e.g. 50
}

export interface CommissionResult {
    grossAmount: number
    commissionAmount: number
    fixedFees: number
    netPayout: number
}

/**
 * PURE FUNCTION
 * Input: Amount + Rules
 * Output: Final Calculation
 * Dependencies: NONE
 */
export function calculateCommission(grossAmount: number, rules: CommissionRules): CommissionResult {
    // 1. Calculate percentage cut
    const commission = grossAmount * rules.percentageRate

    // 2. Calculate fixed cuts
    const totalFixed = rules.fixedPlatformFee + rules.fixedServiceFee

    // 3. Calculate final payout
    const net = grossAmount - commission - totalFixed
    
    // Business Rule: Payouts cannot be negative
    const safeNet = Math.max(0, net)

    return {
        grossAmount,
        commissionAmount: Number(commission.toFixed(2)),
        fixedFees: totalFixed,
        netPayout: Number(safeNet.toFixed(2)),
    }
}
```

---

## 3. The Shell (Orchestrator)

This code lives in `api/handler.ts` (proxied by Next.js API Routes). It connects the "Real World" (Database) to the "Pure Logic".

```typescript
// src/features/billing/api/handler.ts
import { db } from '@/core/db'
import { calculateCommission } from '../domain/commission'

export async function processPayout(userId: string, amount: number) {

    // ---------------------------------------------------------
    // STEP 1: GATHER CONTEXT (Infrastructure Layer)
    // ---------------------------------------------------------
    // Fetch the dynamic rules from the DB. 
    // This could be from a GlobalConfig table, UserTier, or anything.
    const globalSettings = await db.settings.findFirst({ where: { key: 'global_rates' } })
    
    // Map DB data to our Domain Contract
    const rules = {
        percentageRate: globalSettings.commission_pct,    // e.g. 0.14
        fixedPlatformFee: globalSettings.platform_fee,    // e.g. 20
        fixedServiceFee: globalSettings.service_fee       // e.g. 50
    }

    // ---------------------------------------------------------
    // STEP 2: EXECUTE LOGIC (Domain Layer)
    // ---------------------------------------------------------
    // Pass the raw data + the rules into the pure function.
    const result = calculateCommission(amount, rules)

    // ---------------------------------------------------------
    // STEP 3: PERSIST RESULTS (Infrastructure Layer)
    // ---------------------------------------------------------
    await db.payout.create({
        data: {
            userId,
            amount: result.netPayout,
            fees: result.commissionAmount + result.fixedFees,
            metadata: result // Store full breakdown for transparency
        }
    })

    return result
}
```

---

## 4. Why this approach?

### A. Testability
You can verify the math without a database.

```typescript
// src/features/billing/domain/commission.test.ts
test('calculates customized rates correctly', () => {
    // We make up "Mock Rules" on the fly
    const highFees = { percentageRate: 0.50, fixedPlatformFee: 100, fixedServiceFee: 0 }
    
    const result = calculateCommission(1000, highFees)
    
    // 1000 * 0.5 = 500. Fixed = 100. Net = 400.
    expect(result.netPayout).toBe(400) 
})
```

### B. Flexibility
If you decide tomorrow that "Gold Users" get lower fees, you change **Step 1 (Gather Context)** to fetch rules from the `User` table instead of `Settings`. **Step 2 (The Logic)** doesn't change at all.

### C. Clarity
The business logic is not buried inside an `await db.find()` block. It stands alone as plain code.
