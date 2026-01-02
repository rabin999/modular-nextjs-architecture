
import { SSOProvider, SSOConfig, SSOPUser } from '../types'

export class GoogleProvider implements SSOProvider {
    private config: SSOConfig
    private readonly AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
    private readonly TOKEN_URL = 'https://oauth2.googleapis.com/token';
    private readonly USER_INFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

    constructor(config: SSOConfig) {
        if (!config.clientId || !config.clientSecret) {
            throw new Error('Google SSO credentials (clientId/clientSecret) are missing.')
        }

        this.config = config
    }

    getAuthorizationUrl(state: string): string {
        const GOOGLE_SCOPES = {
            OPENID: 'openid',
            EMAIL: 'email',
            PROFILE: 'profile',
            PHONE: 'https://www.googleapis.com/auth/user.phonenumbers.read',
            ADDRESS: 'https://www.googleapis.com/auth/user.addresses.read',
            DRIVE_READONLY: 'https://www.googleapis.com/auth/drive.readonly',
            DRIVE_FILE: 'https://www.googleapis.com/auth/drive.file',
            CALENDAR_READONLY: 'https://www.googleapis.com/auth/calendar.readonly',
            GMAIL_READONLY: 'https://www.googleapis.com/auth/gmail.readonly',
        }

        const scopes = this.config.scopes?.join(' ') ||
            `${GOOGLE_SCOPES.OPENID} ${GOOGLE_SCOPES.EMAIL} ${GOOGLE_SCOPES.PROFILE} ${GOOGLE_SCOPES.PHONE} ${GOOGLE_SCOPES.ADDRESS}`

        const params = new URLSearchParams({
            client_id: this.config.clientId!,
            redirect_uri: this.config.redirectUri,
            response_type: 'code',
            scope: scopes,
            access_type: 'offline',
            state: state,
            prompt: 'consent',
        })

        return `${this.AUTH_URL}?${params.toString()}`
    }

    async getUser(code: string): Promise<SSOPUser> {
        const tokenParams = new URLSearchParams({
            code,
            client_id: this.config.clientId!,
            client_secret: this.config.clientSecret!,
            redirect_uri: this.config.redirectUri,
            grant_type: 'authorization_code',
        })

        const tokenResponse = await fetch(this.TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: tokenParams,
        })

        if (!tokenResponse.ok) {
            throw new Error(await tokenResponse.text())
        }

        const tokens = await tokenResponse.json()

        /**
         * Fetch basic user info
         */
        const userResponse = await fetch(this.USER_INFO_URL, {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        })

        if (!userResponse.ok) {
            throw new Error('Failed to fetch user info')
        }

        const userData = await userResponse.json()

        /**
         * Fetch extended profile data (phone, address) from People API
         */
        const peopleResponse = await fetch(
            'https://people.googleapis.com/v1/people/me?personFields=phoneNumbers,addresses',
            {
                headers: { Authorization: `Bearer ${tokens.access_token}` },
            }
        )

        let phone = undefined
        let address = undefined

        if (peopleResponse.ok) {
            const peopleData = await peopleResponse.json()
            phone = peopleData.phoneNumbers?.[0]?.value
            address = peopleData.addresses?.[0]?.formattedValue
        }

        return {
            id: userData.sub,
            email: userData.email,
            name: userData.name,
            picture: userData.picture,
            phone,
            address,
            provider: 'google',
            providerId: userData.sub,
        }
    }
}
