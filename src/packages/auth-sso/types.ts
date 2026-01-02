/**
 * SSO Provider User Data
 */
export interface SSOPUser {
    id: string
    email: string
    name: string
    picture?: string
    phone?: string
    address?: string
    provider: string
    providerId: string
}

/**
 * SSO Provider Configuration
 */
export interface SSOConfig {
    clientId?: string
    clientSecret?: string
    redirectUri: string
    scopes?: string[]
}

/**
 * SSO Provider Interface
 * All providers must implement these methods
 */
export interface SSOProvider {
    getAuthorizationUrl(state: string): string
    getUser(code: string): Promise<SSOPUser>
}

/**
 * Session Payload Structure
 */
export type SessionPayload = {
    userId: string
    email: string
    role: string
    [key: string]: unknown
}

/**
 * Session Manager Interface
 * Enforces contract for session management operations
 */
export interface ISessionManager {
    sign(payload: SessionPayload, expiresIn?: string): Promise<string>
    verify<T = SessionPayload>(token: string): Promise<T | null>
    createSessionCookie(payload: SessionPayload): Promise<void>
    getSession(): Promise<SessionPayload | null>
    clearSession(): Promise<void>
    updateSession(updates: Partial<SessionPayload>): Promise<void>
}
