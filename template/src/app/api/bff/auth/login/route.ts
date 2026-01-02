import { NextResponse } from 'next/server'
import { ENDPOINTS } from '@/core/api/endpoints'

export async function POST(request: Request) {
    const body = await request.json()

    // Proxy to external backend
    const res = await fetch(`${ENDPOINTS.FAKESTORE_BASE}/auth/login`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok) {
        return NextResponse.json(
            { ok: false, error: { message: 'Authentication failed', code: 'AUTH_FAILED', status: res.status } },
            { status: res.status }
        )
    }

    const data = await res.json()

    // FakeStore returns { token: "..." }
    // We enrich it slightly for our frontend demo
    return NextResponse.json({
        ok: true,
        data: {
            token: data.token,
            user: {
                id: 1,
                username: body.username || 'user',
            },
        },
    })
}
