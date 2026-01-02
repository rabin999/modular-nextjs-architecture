'use client'

import { Button } from '@/shared/ui/Button'
import { useCart } from '@/features/cart/context'

interface Product {
    id: number | string
    title: string
    price: number
}

interface AddToCartButtonProps {
    productId: number | string
    product?: Product // Optional because the interface might be loose, but we expect it
}

export function AddToCartButton({ productId, product }: AddToCartButtonProps) {
    const { addItem } = useCart()

    const handleAddToCart = () => {
        if (!product) {
            console.error('Product data missing for Add to Cart')
            return
        }

        addItem({
            id: String(product.id),
            name: product.title,
            price: product.price
        })
        alert('Added to cart!')
    }

    return (
        <Button onClick={handleAddToCart} className="w-full md:w-auto">
            Add to Cart
        </Button>
    )
}
