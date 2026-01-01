import DOMPurify from 'isomorphic-dompurify'

/**
 * Prevents HTTP Parameter Pollution by ensuring a parameter is a single string
 * @param mode 'strict' throws error, 'last' returns last value
 */
export function ensureSingle(param: string | string[] | undefined, mode: 'last' | 'strict' = 'strict'): string | undefined {
    if (!param) return undefined

    if (Array.isArray(param)) {
        if (mode === 'strict') {
            throw new Error('Security Error: HTTP Parameter Pollution Detected')
        }
        return param[param.length - 1]
    }

    return param
}

/**
 * Sanitizes input using DOMPurify to prevent XSS attacks
 */
export function sanitizeString(input: string): string {
    if (typeof input !== 'string') return input

    return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
    }).trim()
}

/**
 * Recursively sanitizes all string values in an object
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
            cleanObj[key] = sanitizeObject(value)
        }
        return cleanObj as T
    }
    return input
}
