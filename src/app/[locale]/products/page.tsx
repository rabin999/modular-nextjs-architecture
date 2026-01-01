import { REGISTRY } from '@/features/registry'

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ category?: string }>
    params: Promise<{ locale: string }>
}) {
    // Determine card version from registry
    // Determine card version from registry
    const cardVersion = REGISTRY.config.ui.productCard as 'v1' | 'v2'

    // Resolve capabilities asynchronously
    const capabilityLoaders = Object.values(REGISTRY.capabilities).map(loader => (loader ? loader() : null))
    const capabilityManifests = (await Promise.all(capabilityLoaders)).filter(Boolean)

    const capabilities = capabilityManifests.filter(cap => cap && cap.enabled).map(cap => ({ slot: cap!.slot, component: cap!.component }))

    const loadFeature = REGISTRY.features['catalog-products']
    const featureManifest = loadFeature ? await loadFeature() : null
    const FeaturePage = featureManifest?.components?.ProductsPage

    if (!FeaturePage) return null

    return <FeaturePage searchParams={searchParams} cardVersion={cardVersion} capabilities={capabilities} />
}
