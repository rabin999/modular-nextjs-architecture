import { NextResponse } from 'next/server'
import { apiClient } from '@/core/api/client'
import { ENDPOINTS } from '@/core/api/endpoints'

export async function GET() {
    const result = await apiClient(`${ENDPOINTS.FAKESTORE_BASE}/products/categories`)

    if (!result.ok) {
        return NextResponse.json({ ok: false, error: result.error }, { status: result.error.status || 500 })
    }

    return NextResponse.json({ ok: true, data: result.data })
}
