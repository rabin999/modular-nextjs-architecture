import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/core/i18n/routing'
import { isRtl, Locale } from '@/core/i18n/config'
import '../globals.css'
import { Footer } from '@/shared/ui/Footer'
import { ToastProvider } from '@/shared/ui/Toast'

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}) {
    const { locale: rawLocale } = await params
    const locale = rawLocale as Locale

    // Ensure that the incoming `locale` is valid
    if (!routing.locales.includes(locale)) {
        notFound()
    }

    // Providing all messages to the client
    // Side effect: requests already loaded the messages
    const messages = await getMessages()
    const t = await getTranslations('Navigation')

    const direction = isRtl(locale) ? 'rtl' : 'ltr'

    return (
        <html lang={locale} dir={direction}>
            <body className="min-h-screen bg-slate-50 font-sans text-slate-900">
                <NextIntlClientProvider messages={messages}>
                    <ToastProvider>
                        {/* Simple Shell */}
                        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                                <div className="font-bold text-xl">EnterpriseDemo</div>
                                <nav className="flex gap-4">
                                    <a href={`/${locale}`} className="hover:underline">{t('home')}</a>
                                    <a href={`/${locale}/products`} className="hover:underline">{t('products')}</a>
                                    <a href={`/${locale}/login`} className="hover:underline font-medium text-blue-600">{t('login')}</a>
                                </nav>
                            </div>
                        </header>
                        <main className="flex-1">
                            {children}
                        </main>
                        <Footer />
                    </ToastProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    )
}
