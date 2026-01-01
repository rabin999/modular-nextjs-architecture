import { AppError, ErrorCode, StandardAppError } from './error.types'

export function normalizeError(error: unknown): StandardAppError {
    if (error instanceof AppError) {
        return error
    }

    if (error instanceof Error) {
        return {
            code: 'UNKNOWN',
            message: error.message,
            originalError: error,
        }
    }

    return {
        code: 'UNKNOWN',
        message: 'An unknown error occurred',
        originalError: error,
    }
}

export async function handleApiError(response: Response) {
    if (!response.ok) {
        let code = 'INTERNAL_ERROR'
        if (response.status === 404) code = 'NOT_FOUND'
        if (response.status === 401) code = 'UNAUTHORIZED'
        if (response.status === 400) code = 'VALIDATION_ERROR'

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw new AppError(code as ErrorCode, response.statusText, response.status)
    }
}
