
import { NextRequest, NextResponse } from 'next/server'
import { SSOFactory, SupportedProvider } from '../factory'
import { SessionManager } from '../session'
import { cookies } from 'next/headers'

export async function callbackHandler(
    request: NextRequest,
    { params }: { params: Promise<{ provider: string }> }
) {
    let providerName = '' // For error logging

    try {
        const { provider } = await params
        providerName = provider // Save for error handler
        const searchParams = request.nextUrl.searchParams
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const oauthError = searchParams.get('error')

        if (oauthError) {
            return NextResponse.redirect(new URL(`/en/login?error=${oauthError}`, request.url))
        }

        if (!code || !state) {
            return NextResponse.redirect(new URL('/en/login?error=missing_params', request.url))
        }

        const cookieStore = await cookies()
        const storedState = cookieStore.get('oauth_state')?.value
        cookieStore.delete('oauth_state')

        if (!storedState || state !== storedState) {
            return NextResponse.redirect(new URL('/en/login?error=invalid_state', request.url))
        }

        const ssoProvider = SSOFactory.getProvider(provider as SupportedProvider)
        const user = await ssoProvider.getUser(code)

        /**
         * Type assertion: user may have provider-specific fields beyond BaseUserData
         * (e.g., GoogleUserData includes picture, phone, address)
         */
        const extendedUser = user as any

        await SessionManager.createSessionCookie({
            userId: user.id,
            email: user.email,
            name: user.name,
            ...(extendedUser.picture && { picture: extendedUser.picture }),
            ...(extendedUser.phone && { phone: extendedUser.phone }),
            ...(extendedUser.address && { address: extendedUser.address }),
            ...(extendedUser.providerId && { providerId: extendedUser.providerId }),
            role: 'user',
            provider: user.provider,
        })

        return NextResponse.redirect(new URL('/en/dashboard', request.url))

    } catch (error) {
        /**
         * Detailed error logging for debugging
         */
        console.error('[SSO Callback Error] Detailed error information:', {
            provider: providerName,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
            } : error,
            timestamp: new Date().toISOString(),
        })

        /**
         * Extract error details for better user feedback
         */
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        const errorType = errorMessage.toLowerCase().includes('credential') ? 'auth_failed' :
            errorMessage.toLowerCase().includes('network') ? 'network_error' :
                errorMessage.toLowerCase().includes('state') ? 'invalid_state' :
                    'server_error'

        return NextResponse.redirect(
            new URL(`/en/login?error=${errorType}&details=${encodeURIComponent(errorMessage.substring(0, 100))}`, request.url)
        )
    }
}
