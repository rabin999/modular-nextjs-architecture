export interface CartItem {
    id: string
    name: string
    price: number
    quantity: number
}

export interface CartSummary {
    items: CartItem[]
    subtotal: number
    tax: number
    total: number
}

export const CART_CONSTANTS = {
    TAX_RATE: 0.1, // 10%
    FREE_SHIPPING_THRESHOLD: 100,
}

/**
 * PURE DOMAIN LOGIC
 * Calculates totals based on items.
 */
export function calculateCartSummary(items: CartItem[]): CartSummary {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const tax = subtotal * CART_CONSTANTS.TAX_RATE
    const total = subtotal + tax

    return {
        items,
        subtotal: Number(subtotal.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        total: Number(total.toFixed(2)),
    }
}
