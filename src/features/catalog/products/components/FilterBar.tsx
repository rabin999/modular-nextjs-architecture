'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ChangeEvent, useTransition } from 'react'

interface FilterBarProps {
    categories: string[]
}

export function FilterBar({ categories }: FilterBarProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const t = useTranslations('Catalog.filters')
    const [isPending, startTransition] = useTransition()

    const currentCategory = searchParams.get('category') || ''

    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value
        const params = new URLSearchParams(searchParams)
        if (value) {
            params.set('category', value)
        } else {
            params.delete('category')
        }

        startTransition(() => {
            router.push(`?${params.toString()}`)
        })
    }

    return (
        <div className="flex items-center justify-between mb-8 p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
                <label htmlFor="category-select" className="text-sm font-medium text-slate-700">
                    {t('placeholder')}
                </label>
                <select
                    id="category-select"
                    className="block w-48 rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-slate-600 sm:text-sm sm:leading-6"
                    value={currentCategory}
                    onChange={handleChange}
                    disabled={isPending}
                >
                    <option value="">{t('all')}</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat} className="capitalize">
                            {cat}
                        </option>
                    ))}
                </select>
            </div>
            {isPending && <span className="text-sm text-slate-400">Updating...</span>}
        </div>
    )
}
