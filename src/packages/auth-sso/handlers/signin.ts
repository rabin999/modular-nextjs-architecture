
import { NextRequest, NextResponse } from 'next/server'
import { SSOFactory, SupportedProvider } from '../'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function signinHandler(
    request: NextRequest,
    { params }: { params: Promise<{ provider: string }> }
) {
    try {
        const { provider } = await params
        const ssoProvider = SSOFactory.getProvider(provider as SupportedProvider)
        const state = crypto.randomUUID()

        const cookieStore = await cookies()
        cookieStore.set('oauth_state', state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 10,
        })

        const url = ssoProvider.getAuthorizationUrl(state)
        return NextResponse.redirect(url)

    } catch (error) {
        console.error('[SSO Signin Error]', error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal Server Error' },
            { status: 500 }
        )
    }
}
