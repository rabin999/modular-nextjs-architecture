import { CapabilityManifest } from '@/core/types/registry'
import dynamic from 'next/dynamic'

const EditButtonV1 = dynamic(() => import('./ui/v1/EditButton').then(mod => mod.EditButton))
const EditButtonV2 = dynamic(() => import('./ui/v2/EditButton').then(mod => mod.EditButton))

export const editProductCapabilityV1: CapabilityManifest = {
    id: 'edit-product',
    description: 'Allows users to edit product details (V1)',
    slot: 'detailActions',
    enabled: true,
    component: EditButtonV1,
    messages: {
        en: () => import('./i18n/en.json'),
        ar: () => import('./i18n/ar.json'),
    }
}

export const editProductCapabilityV2: CapabilityManifest = {
    ...editProductCapabilityV1,
    description: 'Allows users to edit product details (V2)',
    component: EditButtonV2,
    messages: {
        en: () => import('./i18n/v2/en.json'),
    }
}
