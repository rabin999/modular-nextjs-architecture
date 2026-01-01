import { REGISTRY } from '@/features/registry'

export default async function Page() {
    // Lazy-load manifest
    const featureLoader = REGISTRY.features['auth-login']
    const featureManifest = featureLoader ? await featureLoader() : null

    // Extract component
    const FeaturePage = featureManifest?.components?.LoginPage

    if (!FeaturePage) return null

    return <FeaturePage />
}
