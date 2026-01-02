
import { SessionManager } from './session'
import type { SessionPayload } from './types'
import { getCachedSession } from './cache'

/**
 * Gets the current authenticated user from the session
 * Uses cached version for better performance
 */
export async function getCurrentUser() {
    return await getCachedSession()
}

/**
 * Clears the current user session
 */
export async function clearSession() {
    await SessionManager.clearSession()
}

/**
 * Updates the current session with partial data
 */
export async function updateSession(updates: Partial<SessionPayload>) {
    await SessionManager.updateSession(updates)

    /**
     * Revalidate session cache after update
     */
    const { revalidateTag } = await import('next/cache')
    const { AUTH_CACHE_TAGS } = await import('./cache')
    revalidateTag(AUTH_CACHE_TAGS.SESSION, {})
}
