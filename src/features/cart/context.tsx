'use client'
// Force rebuild

import React, { createContext, useContext, useState, useEffect } from 'react'
import { CartItem, CartSummary, calculateCartSummary } from './domain/cart'

interface CartContextType {
    items: CartItem[]
    summary: CartSummary
    addItem: (item: Omit<CartItem, 'quantity'>) => void
    removeItem: (id: string) => void
    clearCart: () => void
    itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [mounted, setMounted] = useState(false)

    // Persist to local storage
    useEffect(() => {
        const saved = localStorage.getItem('cart_v1')
        if (saved) {
            try {
                setItems(JSON.parse(saved))
            } catch (e) {
                console.error('Failed to parse cart', e)
            }
        }
        setMounted(true)
    }, [])

    useEffect(() => {
        if (mounted) {
            localStorage.setItem('cart_v1', JSON.stringify(items))
        }
    }, [items, mounted])

    const summary = calculateCartSummary(items)
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

    const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
        setItems(current => {
            const existing = current.find(i => i.id === newItem.id)
            if (existing) {
                return current.map(i =>
                    i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i
                )
            }
            return [...current, { ...newItem, quantity: 1 }]
        })
    }

    const removeItem = (id: string) => {
        setItems(current => current.filter(i => i.id !== id))
    }

    const clearCart = () => setItems([])

    if (!mounted) {
        return null // Prevent hydration mismatch
    }

    return (
        <CartContext.Provider value={{ items, summary, addItem, removeItem, clearCart, itemCount }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
