import DOMPurify from 'isomorphic-dompurify'
/**
 * Security Guard
 * Utilities for cleaning input and preventing common web attacks like HPP.
 */

/**
 * Prevents HTTP Parameter Pollution (HPP) by ensuring a parameter is a single string.
 * If multiple values are provided (e.g. ?id=1&id=unchecked_value), it returns the LAST one by default (common framework behavior)
 * or throws an error if 'strict' mode is on.
 */
export function ensureSingle(
    param: string | string[] | undefined,
    mode: 'last' | 'strict' = 'strict'
): string | undefined {
    if (!param) return undefined

    if (Array.isArray(param)) {
        if (mode === 'strict') {
            throw new Error('Security Error: HTTP Parameter Pollution Detected (Multiple values provided for single-value field)')
        }
        return param[param.length - 1]
    }

    // ...existing code...
    return param
}

/**
 * Advanced Input Sanitization using DOMPurify (OWASP Recommended)
 * Removes dangerous XSS vectors via a dedicated HTML parser.
 * This is significantly safer than Regex replacement.
 */
export function sanitizeString(input: string): string {
    if (typeof input !== 'string') return input

    // Configure DOMPurify to strip everything except safe text if necessary,
    // or allow basic formatting. For strict input, basic 'sanitize' is usually enough
    // to kill scripts/iframes.
    return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: [], // Strict mode: Remove ALL tags, keep only text content
        ALLOWED_ATTR: []
    }).trim()
}

/**
 * Sanitizes an object deeply (recursive).
 */
export function sanitizeObject<T>(input: T): T {
    if (typeof input === 'string') {
        return sanitizeString(input) as unknown as T
    }
    if (Array.isArray(input)) {
        return input.map(i => sanitizeObject(i)) as unknown as T
    }
    if (typeof input === 'object' && input !== null) {
        const cleanObj: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(input)) {
            // Also sanitize keys if necessary, but usually just values
            cleanObj[key] = sanitizeObject(value)
        }
        return cleanObj as T
    }
    return input
}
