import { getTranslations } from 'next-intl/server'
import { ENDPOINTS } from '@/core/api/endpoints'
import { apiClient } from '@/core/api/client'
import { ComponentType } from 'react'
import { ensureSingle, sanitizeString } from '@/core/security/guard'

// Components
import { FilterBar } from '../components/FilterBar'
import { ProductGrid } from '../components/ProductGrid'
import { ProductCard as ProductCardV1 } from '../ui/v1/ProductCard'
import { ProductCard as ProductCardV2 } from '../ui/v2/ProductCard'

// Server-side data fetching
async function getProducts(category?: string) {
    const url = category ? `${ENDPOINTS.FAKESTORE_BASE}/products/category/${category}` : `${ENDPOINTS.FAKESTORE_BASE}/products`

    // Using core client (server-side call to external API)
    const res = await apiClient<any[]>(url)
    if (!res.ok) throw res.error
    return res.data
}

async function getCategories() {
    const res = await apiClient<string[]>(`${ENDPOINTS.FAKESTORE_BASE}/products/categories`)
    if (!res.ok) throw res.error
    return res.data
}

interface Capability {
    slot: string
    component: ComponentType<any>
}

interface PageProps {
    searchParams: Promise<{ category?: string }>
    cardVersion?: 'v1' | 'v2'
    capabilities?: Capability[]
}

export async function ProductsPage({ searchParams, cardVersion = 'v1', capabilities = [] }: PageProps) {
    const t = await getTranslations('Catalog')
    const { category: rawCategory } = await searchParams

    // 🛡️ Security Check: Prevent HPP & Sanitization
    // If URL is ?category=A&category=B, ensureSingle will return 'B'
    // sanitizeString ensures no XSS even if we echo this back
    const category = sanitizeString(ensureSingle(rawCategory, 'last') || '') || undefined

    const products = await getProducts(category)
    const categories = await getCategories()

    // 1. Resolve Product Card Version
    const CardComponent = cardVersion === 'v2' ? ProductCardV2 : ProductCardV1

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">{t('title')}</h1>
                    <FilterBar categories={categories} />
                </div>

                <ProductGrid products={products} CardComponent={CardComponent} actionsRegistry={capabilities} />
            </div>
        </div>
    )
}
