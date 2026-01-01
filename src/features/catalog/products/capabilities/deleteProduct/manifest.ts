import { CapabilityManifest } from '@/core/types/registry'
import dynamic from 'next/dynamic'
const DeleteButton = dynamic(() => import('./ui/DeleteButton').then(mod => mod.DeleteButton))

export const deleteProductCapability: CapabilityManifest = {
    id: 'delete-product',
    description: 'Allows users to delete a product',
    enabled: true,
    slot: 'rowActions',
    component: DeleteButton,
    messages: {
        en: () => import('./i18n/en.json'),
        ar: () => import('./i18n/ar.json'),
    },
}

export const deleteProductDetailCapability: CapabilityManifest = {
    ...deleteProductCapability,
    id: 'delete-product-detail',
    slot: 'detailActions',
}
