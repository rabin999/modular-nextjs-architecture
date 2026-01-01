export async function getStandardHeaders() {
    let locale = 'en'

    if (typeof window === 'undefined') {
        try {
            const { getLocale } = await import('next-intl/server')
            locale = await getLocale()
        } catch {}
    } else {
        locale = document.documentElement.lang || 'en'
    }

    return {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-app-version': '1.0.0',
        'Accept-Language': locale,
        'x-request-id': crypto.randomUUID(),
    }
}
