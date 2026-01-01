import { getStandardHeaders } from './headers'
import { handleApiError, normalizeError } from '../errors/normalize'
import { AppError } from '../errors/error.types'
import { logger } from '../observability/logger'
import { ZodType, ZodError } from 'zod'

interface RequestOptions<TResponse> extends RequestInit {
    authToken?: string
    schema?: ZodType<TResponse>
}

export async function apiClient<T>(
    url: string,
    options: RequestOptions<T> = {}
): Promise<{ ok: true; data: T } | { ok: false; error: AppError }> {
    const requestId = crypto.randomUUID() // Generate internal ID for tracing this call
    const context = { requestId, method: options.method || 'GET', url }

    try {
        const headers = await getStandardHeaders()

        // Override/Merge headers
        const config: RequestInit = {
            ...options,
            headers: {
                ...headers,
                'x-request-id': requestId, // Ensure downstream sees this ID
                ...options.headers,
            },
        }

        logger.info('API Request Started', context)

        const response = await fetch(url, config)

        logger.info('API Response Received', {
            ...context,
            status: response.status
        })

        await handleApiError(response)

        const rawData = await response.json()

        // Data Contract Validation
        let data: T = rawData
        if (options.schema) {
            try {
                data = options.schema.parse(rawData)
            } catch (validationError) {
                if (validationError instanceof ZodError) {
                    const zodError = validationError as ZodError
                    logger.error('Data Contract Violation', {
                        ...context,
                        errors: zodError.issues,
                        rawData
                    })
                    // We treat contract violations as system errors
                    throw new Error(`Data Contract Violation: ${zodError.message}`)
                }
                throw validationError
            }
        }

        return { ok: true, data }

    } catch (error) {
        logger.error('API Request Failed', { ...context, error })

        const normalized = normalizeError(error)
        return {
            ok: false,
            error: new AppError(normalized.code, normalized.message, normalized.status, normalized.originalError)
        }
    }
}
