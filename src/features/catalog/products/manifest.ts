import { FeatureManifest } from '@/core/types/registry'
import dynamic from 'next/dynamic'
const ProductsPage = dynamic(() => import('./page/ProductsPage').then(mod => mod.ProductsPage))

export const catalogManifest: FeatureManifest = {
    id: 'catalog-products',
    name: 'Product Catalog',
    enabled: true,
    components: {
        ProductsPage,
    },
    messages: {
        en: () => import('./i18n/en.json'),
        ar: () => import('./i18n/ar.json'),
    },
}
