import type { CapabilityManifest } from '@/core/types/registry'
import dynamic from 'next/dynamic'

const AddToCartButton = dynamic(() => import('./ui/AddToCartButton').then(m => m.AddToCartButton))

export const addToCartCapability: CapabilityManifest = {
    id: 'add-to-cart',
    description: 'Add product to shopping cart',
    enabled: true,
    slot: 'detailActions',
    component: AddToCartButton,
}
