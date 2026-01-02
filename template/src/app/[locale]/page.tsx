import { REGISTRY } from '@/features/registry'

export default async function HomePage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
    // Lazy-load manifests
    const marketingLoader = REGISTRY.features['marketing-home']
    const catalogLoader = REGISTRY.features['catalog-products']

    const marketingManifest = marketingLoader ? await marketingLoader() : null
    const catalogManifest = catalogLoader ? await catalogLoader() : null

    if (!marketingManifest?.components?.HeroSection) {
        return null
    }

    const Hero = marketingManifest.components.HeroSection
    const ProductsList = catalogManifest?.components?.ProductsPage

    return (
        <main>
            <Hero />
            <div className="container mx-auto px-4 py-12">
                {ProductsList ? <ProductsList searchParams={searchParams} /> : <p className="text-center">Catalog feature is disabled.</p>}
            </div>
        </main>
    )
}
