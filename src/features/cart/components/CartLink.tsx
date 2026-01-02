'use client'

import { useCart } from '../context'
import { useTranslations } from 'next-intl'
import { Link } from '@/core/i18n/routing'

export function CartLink() {
    const { itemCount } = useCart()
    const t = useTranslations('Navigation')

    return (
        <Link href="/cart" className="hover:underline flex items-center gap-1">
            {t('cart')}
            {itemCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                </span>
            )}
        </Link>
    )
}
