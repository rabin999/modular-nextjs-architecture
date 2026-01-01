import { getTranslations } from 'next-intl/server'
import { ENDPOINTS } from '@/core/api/endpoints'
import { apiClient } from '@/core/api/client'
import { REGISTRY } from '@/features/registry'
import { formatMoney } from '@/shared/utils/money'
import { Link } from '@/core/i18n/routing'

async function getProduct(id: string) {
    const res = await apiClient<any>(`${ENDPOINTS.FAKESTORE_BASE}/products/${id}`)
    if (!res.ok) throw res.error
    return res.data
}

interface PageProps {
    params: { id: string }
}

export async function ProductDetailPage({ params }: PageProps) {
    const t = await getTranslations('ProductDetail')
    const product = await getProduct(params.id)

    // Resolve capability slots (Lazy Loaded)
    const capabilityLoaders = Object.values(REGISTRY.capabilities).map(l => l())
    const capabilityManifests = (await Promise.all(capabilityLoaders)).filter(Boolean)

    const detailActions = capabilityManifests
        .filter(cap => cap && cap.slot === 'detailActions' && cap.enabled)
        .map((cap, idx) => {
            const Component = cap!.component
            return <Component key={idx} productId={product.id} />
        })

    return (
        <div className="container mx-auto px-4 py-8">
            <Link href="/products" className="mb-6 inline-block text-slate-500 hover:text-slate-900">
                &larr; {t('back')}
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-100 flex items-center justify-center">
                    <img src={product.image} alt={product.title} className="max-h-[400px] w-auto max-w-full object-contain" />
                </div>

                <div className="flex flex-col gap-6">
                    <h1 className="text-3xl font-bold text-slate-900">{product.title}</h1>

                    <div className="flex items-center gap-4">
                        <span className="inline-block bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium capitalize">
                            {product.category}
                        </span>
                        <span className="text-2xl font-bold text-slate-900">{formatMoney(product.price)}</span>
                    </div>

                    <div className="prose prose-slate">
                        <h3 className="text-lg font-semibold">{t('description')}</h3>
                        <p>{product.description}</p>
                    </div>

                    <div className="flex gap-4 mt-8 pt-8 border-t border-slate-200">{detailActions}</div>
                </div>
            </div>
        </div>
    )
}
