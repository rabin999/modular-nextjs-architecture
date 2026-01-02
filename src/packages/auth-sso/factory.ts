
import { GoogleProvider } from './providers/google'
import { SSOProvider } from './types'

export type SupportedProvider = 'google'

export class SSOFactory {
    static getProvider(provider: SupportedProvider): SSOProvider {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL

        if (!baseUrl) {
            throw new Error('NEXT_PUBLIC_APP_URL is not defined')
        }

        switch (provider) {
            case 'google':
                return new GoogleProvider({
                    /**
                     * Pass empty string to let Provider throw if missing
                     */
                    clientId: process.env.GOOGLE_CLIENT_ID || '',
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
                    redirectUri: `${baseUrl}/api/auth/sso/google/callback`,
                })

            default:
                throw new Error(`Provider ${provider} is not supported.`)
        }
    }
}
