'use client'

import { Button } from '@/shared/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card'
import { useCart } from '../context'

export function CartPage() {
    const { items, summary, clearCart, removeItem } = useCart()

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Items List */}
                <div className="md:col-span-2 space-y-4">
                    {items.length === 0 ? (
                        <p className="text-gray-500">Your cart is empty.</p>
                    ) : (
                        items.map((item) => (
                            <Card key={item.id}>
                                <CardContent className="flex justify-between items-center p-4">
                                    <div>
                                        <h3 className="font-semibold">{item.name}</h3>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="font-medium">${item.price.toFixed(2)}</p>
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-red-500 hover:text-red-700 text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}

                    <div className="flex gap-4 mt-6">
                        {items.length > 0 && <Button variant="outline" onClick={clearCart}>Clear Cart</Button>}
                    </div>
                </div>

                {/* Summary */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${summary.subtotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax (10%)</span>
                                <span>${summary.tax}</span>
                            </div>
                            <div className="border-t pt-2 mt-2 font-bold flex justify-between">
                                <span>Total</span>
                                <span>${summary.total}</span>
                            </div>
                            <Button className="w-full mt-4">Checkout</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
