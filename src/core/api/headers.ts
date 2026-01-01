// Cross-environment compatible way to get headers

export async function getStandardHeaders() {
    let locale = 'en'

    // Check if running on server
    if (typeof window === 'undefined') {
        try {
            // Dynamically import to avoid bundling server code in client
            const { getLocale } = await import('next-intl/server')
            locale = await getLocale()
        } catch {
            // ignore
        }
    } else {
        // Client side - could read from cookie or HTML lang attribute
        locale = document.documentElement.lang || 'en'
    }

    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-app-version': '1.0.0',
        'Accept-Language': locale,
        'x-request-id': crypto.randomUUID(),
    }
}
