import type { FeatureManifest } from '@/core/types/registry'
import dynamic from 'next/dynamic'

const CartPage = dynamic(() => import('./page/CartPage').then(m => m.CartPage))

export const cartManifest: FeatureManifest = {
    id: 'cart',
    name: 'Shopping Cart',
    enabled: true,
    components: {
        CartPage,
    },
}
