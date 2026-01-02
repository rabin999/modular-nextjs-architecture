import { REGISTRY } from '@/features/registry'

export default async function CartPageRoute() {
    const cartLoader = REGISTRY.features['cart']
    const cartManifest = cartLoader ? await cartLoader() : null

    if (!cartManifest?.components?.CartPage) {
        return <div className="p-8 text-center text-red-500">Cart feature is currently unavailable.</div>
    }

    const CartPage = cartManifest.components.CartPage

    return (
        <main>
            <CartPage />
        </main>
    )
}
