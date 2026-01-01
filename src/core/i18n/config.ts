export const LOCALES = ['en', 'ar'] as const
export type Locale = (typeof LOCALES)[number]

export function isRtl(locale: string) {
    return locale === 'ar'
}
