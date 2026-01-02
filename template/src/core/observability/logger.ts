type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
    [key: string]: unknown
}

class Logger {
    private formatMessage(level: LogLevel, message: string, context?: LogContext) {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            ...context,
        }
    }

    debug(message: string, context?: LogContext) {
        if (process.env.NODE_ENV === 'development') {
            console.debug(JSON.stringify(this.formatMessage('debug', message, context)))
        }
    }

    info(message: string, context?: LogContext) {
        console.info(JSON.stringify(this.formatMessage('info', message, context)))
    }

    warn(message: string, context?: LogContext) {
        console.warn(JSON.stringify(this.formatMessage('warn', message, context)))
    }

    error(message: string, context?: LogContext) {
        console.error(JSON.stringify(this.formatMessage('error', message, context)))
    }
}

export const logger = new Logger()
