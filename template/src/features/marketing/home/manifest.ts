import { FeatureManifest } from '@/core/types/registry'
import dynamic from 'next/dynamic'
const HeroSection = dynamic(() => import('./sections/HeroSection').then(mod => mod.HeroSection))

export const marketingManifest: FeatureManifest = {
    id: 'marketing-home',
    name: 'Marketing Homepage',
    enabled: true,
    components: {
        HeroSection,
    },
    messages: {
        en: () => import('./i18n/en.json'),
        ar: () => import('./i18n/ar.json'),
    },
}
