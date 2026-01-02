
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import type { SessionPayload, ISessionManager } from './types'

const SECRET_KEY = process.env.AUTH_SECRET || 'dev-secret-key-change-me'
const KEY = new TextEncoder().encode(SECRET_KEY)
const ALG = 'HS256'

export const SessionManager: ISessionManager = {
    async sign(payload: SessionPayload, expiresIn = '7d'): Promise<string> {
        return new SignJWT(payload)
            .setProtectedHeader({ alg: ALG })
            .setIssuedAt()
            .setExpirationTime(expiresIn)
            .sign(KEY)
    },

    async verify<T = SessionPayload>(token: string): Promise<T | null> {
        try {
            const { payload } = await jwtVerify(token, KEY, {
                algorithms: [ALG],
            })
            return payload as T
        } catch {
            return null
        }
    },

    async createSessionCookie(payload: SessionPayload) {
        const token = await this.sign(payload)
        const cookieStore = await cookies()

        cookieStore.set('session_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60,
        })
    },

    async getSession<T extends SessionPayload = SessionPayload>(): Promise<T | null> {
        const cookieStore = await cookies()
        const token = cookieStore.get('session_token')?.value
        if (!token) return null
        return this.verify<T>(token)
    },

    async clearSession(): Promise<void> {
        const cookieStore = await cookies()
        cookieStore.delete('session_token')
    },

    async updateSession<T extends SessionPayload = SessionPayload>(updates: Partial<T>): Promise<void> {
        const currentSession = await this.getSession<T>()
        if (!currentSession) {
            throw new Error('No active session to update')
        }

        const updatedSession = {
            ...currentSession,
            ...updates,
        }

        await this.createSessionCookie(updatedSession)
    },
}
