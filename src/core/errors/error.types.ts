export type ErrorCode =
    | 'UNKNOWN'
    | 'NETWORK_ERROR'
    | 'NOT_FOUND'
    | 'UNAUTHORIZED'
    | 'VALIDATION_ERROR'
    | 'INTERNAL_ERROR'

export interface StandardAppError {
    code: ErrorCode
    message: string
    originalError?: unknown
    status?: number
}

export class AppError extends Error implements StandardAppError {
    constructor(
        public code: ErrorCode,
        public message: string,
        public status?: number,
        public originalError?: unknown
    ) {
        super(message)
        this.name = 'AppError'
    }
}
