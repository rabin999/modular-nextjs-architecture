
import { NextRequest, NextResponse } from 'next/server'
import { SSOFactory, SupportedProvider } from '../factory'
import { SessionManager } from '../session'
import { cookies } from 'next/headers'

export async function callbackHandler(
    request: NextRequest,
    { params }: { params: Promise<{ provider: string }> }
) {
    try {
        const { provider } = await params
        const searchParams = request.nextUrl.searchParams
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        if (error) {
            return NextResponse.redirect(new URL(`/en/login?error=${error}`, request.url))
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

        await SessionManager.createSessionCookie({
            userId: user.id,
            email: user.email,
            name: user.name,
            ...(user.picture && { picture: user.picture }),
            ...(user.phone && { phone: user.phone }),
            ...(user.address && { address: user.address }),
            role: 'user',
            provider: user.provider,
        })

        return NextResponse.redirect(new URL('/en/dashboard', request.url))

    } catch (error) {
        console.error('[SSO Callback Error]', error)
        return NextResponse.redirect(new URL('/en/login?error=server_error', request.url))
    }
}
