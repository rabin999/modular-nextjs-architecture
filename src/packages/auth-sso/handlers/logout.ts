
import { NextRequest, NextResponse } from 'next/server'
import { clearSession } from '../helpers'

/**
 * POST /api/auth/logout - Clears user session
 */
export async function logoutHandler(request: NextRequest) {
    await clearSession()
    return NextResponse.json({ success: true })
}
