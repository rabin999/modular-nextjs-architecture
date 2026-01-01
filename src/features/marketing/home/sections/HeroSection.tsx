import { getTranslations } from 'next-intl/server'

export async function HeroSection() {
    const t = await getTranslations('Marketing.Hero')

    return (
        <section className="bg-slate-900 py-20 text-white">
            <div className="container mx-auto px-4 text-center">
                <h1 className="mb-4 text-5xl font-bold tracking-tight">{t('title')}</h1>
                <p className="mx-auto max-w-2xl text-xl text-slate-400">{t('subtitle')}</p>
            </div>
        </section>
    )
}
