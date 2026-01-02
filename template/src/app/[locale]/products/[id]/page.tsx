import { REGISTRY } from '@/features/registry'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
    const { id } = await params

    // Feature Flag Check & Lazy Load
    const featureLoader = REGISTRY.features['catalog-product-detail']
    const feature = featureLoader ? await featureLoader() : null

    if (!feature || !feature.enabled || !feature.components?.ProductDetailPage) {
        return notFound()
    }

    const ProductDetailPage = feature.components.ProductDetailPage

    return <ProductDetailPage params={{ id }} />
}
