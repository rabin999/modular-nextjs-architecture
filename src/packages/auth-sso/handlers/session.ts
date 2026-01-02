
import { NextResponse } from 'next/server'
import { getCurrentUser } from '../helpers'

/**
 * GET /api/auth/session - Returns current user session with cache control
 */
export async function sessionHandler() {
    const user = await getCurrentUser()

    if (!user) {
        return NextResponse.json(
            { user: null },
            {
                status: 401,
                headers: {
                    'Cache-Control': 'no-store',
                },
            }
        )
    }

    return NextResponse.json(
        { user },
        {
            headers: {
                'Cache-Control': 'private, max-age=60, stale-while-revalidate=30',
            },
        }
    )
}
