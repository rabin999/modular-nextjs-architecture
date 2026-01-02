
export * from './types'
export * from './factory'
export * from './session'
/**
 * Providers are internal to the factory usually, but exporting if direct access is needed
 */
export * from './providers/google'

/**
 * Export Handlers
 */
export { signinHandler } from './handlers/signin'
export { callbackHandler } from './handlers/callback'
export { sessionHandler } from './handlers/session'
export { logoutHandler } from './handlers/logout'

/**
 * Export Helpers
 */
export { getCurrentUser, clearSession, updateSession } from './helpers'

/**
 * Cache utilities
 */
export { AUTH_CACHE_TAGS, getCachedSession } from './cache'

/**
 * Client-side hooks
 */
export { useSession } from './client'
