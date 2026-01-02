import { FeatureManifest } from '@/core/types/registry'
import dynamic from 'next/dynamic'
const LoginPage = dynamic(() => import('./page/LoginPage').then(mod => mod.LoginPage))

export const authManifest: FeatureManifest = {
    id: 'auth-login',
    name: 'Authentication',
    enabled: true,
    components: {
        LoginPage,
    },
    messages: {
        en: () => import('./i18n/en.json'),
        ar: () => import('./i18n/ar.json'),
    },
}
