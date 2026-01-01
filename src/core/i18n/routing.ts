import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

import { LOCALES } from './config'

export const routing = defineRouting({
    locales: LOCALES,
    defaultLocale: 'en'
})

export const { Link, redirect, usePathname, useRouter } =
    createNavigation(routing)
