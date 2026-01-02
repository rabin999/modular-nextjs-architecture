/**
 * Minimal user data that ALL providers must return
 * This is the contract - providers can add more fields
 */
export interface BaseUserData {
    id: string
    email: string
    name: string
    provider: string
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
    getUser(code: string): Promise<BaseUserData>
}

/**
 * Session Payload Structure
 * Contains all user data stored in the JWT session
 */
export interface SessionPayload {
    userId: string        // User's unique identifier
    email: string         // User's email address
    name: string          // User's display name
    provider: string      // OAuth provider ('google', 'facebook', etc.)
    role: string          // Application role ('user', 'admin', etc.)

    /**
     * Optional fields from OAuth providers
     */
    picture?: string      // Profile picture URL
    phone?: string        // Phone number (if provided)
    address?: string      // Address (if provided)
    providerId?: string   // Provider-specific user ID

    /**
     * Index signature for JWT compatibility
     * Allows JWT library to add iat, exp, etc.
     */
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
    getSession<T extends SessionPayload = SessionPayload>(): Promise<T | null>
    clearSession(): Promise<void>
    updateSession<T extends SessionPayload = SessionPayload>(updates: Partial<T>): Promise<void>
}
