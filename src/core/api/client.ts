import { getStandardHeaders } from './headers'
import { handleApiError, normalizeError } from '../errors/normalize'
import { AppError } from '../errors/error.types'
import { logger } from '../observability/logger'
import { ZodType, ZodError } from 'zod'

interface RequestOptions<TResponse> extends RequestInit {
    authToken?: string
    schema?: ZodType<TResponse>
}

/**
 * Standardized API client with logging, error handling, and optional Zod validation
 */
export async function apiClient<T>(
    url: string,
    options: RequestOptions<T> = {}
): Promise<{ ok: true; data: T } | { ok: false; error: AppError }> {
    const requestId = crypto.randomUUID()
    const context = { requestId, method: options.method || 'GET', url }

    try {
        const headers = await getStandardHeaders()

        const config: RequestInit = {
            ...options,
            headers: {
                ...headers,
                'x-request-id': requestId,
                ...options.headers,
            },
        }

        logger.info('API Request Started', context)

        const response = await fetch(url, config)

        logger.info('API Response Received', {
            ...context,
            status: response.status,
        })

        await handleApiError(response)

        const rawData = await response.json()

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
                        rawData,
                    })
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
            error: new AppError(normalized.code, normalized.message, normalized.status, normalized.originalError),
        }
    }
}
