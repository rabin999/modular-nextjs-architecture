import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/core/api/client'
import { ENDPOINTS } from '@/core/api/endpoints'
import { sanitizeString } from '@/core/security/guard'

/**
 * Feature API Handler: Products
 * This logic is owned by the Catalog Feature Team.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const rawCategory = searchParams.get('category')
    const category = rawCategory ? sanitizeString(rawCategory) : undefined

    const url = category ? `${ENDPOINTS.FAKESTORE_BASE}/products/category/${category}` : `${ENDPOINTS.FAKESTORE_BASE}/products`

    // Server-side call to upstream
    const result = await apiClient(url)

    if (!result.ok) {
        return NextResponse.json({ ok: false, error: result.error }, { status: result.error.status || 500 })
    }

    return NextResponse.json({ ok: true, data: result.data })
}
