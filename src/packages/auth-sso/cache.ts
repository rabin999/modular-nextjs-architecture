
import { unstable_cache } from 'next/cache'
import { SessionManager } from './session'
import type { SessionPayload } from './types'

/**
 * Cache tags for auth-related data
 */
export const AUTH_CACHE_TAGS = {
    SESSION: 'auth-session',
    USER: (userId: string) => `user-${userId}`,
} as const

/**
 * Gets the current session with cache tags
 * Uses Next.js unstable_cache for proper tag-based caching
 */
export const getCachedSession = unstable_cache(
    async (): Promise<SessionPayload | null> => {
        return await SessionManager.getSession()
    },
    ['session'],
    {
        tags: [AUTH_CACHE_TAGS.SESSION],
        revalidate: 60, // 60 seconds cache
    }
)
