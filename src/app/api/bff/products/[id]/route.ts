import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/core/api/client'
import { ENDPOINTS } from '@/core/api/endpoints'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const result = await apiClient(`${ENDPOINTS.FAKESTORE_BASE}/products/${id}`)

    if (!result.ok) {
        return NextResponse.json({ ok: false, error: result.error }, { status: result.error.status || 500 })
    }

    return NextResponse.json({ ok: true, data: result.data })
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const result = await apiClient(`${ENDPOINTS.FAKESTORE_BASE}/products/${id}`, {
        method: 'DELETE'
    })

    if (!result.ok) {
        return NextResponse.json({ ok: false, error: result.error }, { status: result.error.status || 500 })
    }

    return NextResponse.json({ ok: true, data: result.data })
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const body = await request.json()
    const result = await apiClient(`${ENDPOINTS.FAKESTORE_BASE}/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body)
    })

    if (!result.ok) {
        return NextResponse.json({ ok: false, error: result.error }, { status: result.error.status || 500 })
    }

    return NextResponse.json({ ok: true, data: result.data })
}
