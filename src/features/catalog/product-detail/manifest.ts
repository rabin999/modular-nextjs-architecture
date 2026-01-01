import { FeatureManifest } from '@/core/types/registry'
import dynamic from 'next/dynamic'
const ProductDetailPage = dynamic(() => import('./page/ProductDetailPage').then(mod => mod.ProductDetailPage))

export const productDetailManifest: FeatureManifest = {
    id: 'catalog-product-detail',
    name: 'Product Details',
    enabled: true,
    components: {
        ProductDetailPage,
    },
    messages: {
        en: () => import('./i18n/en.json'),
        ar: () => import('./i18n/ar.json'),
    },
}
