import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'
import { notFound } from 'next/navigation'
import { REGISTRY } from '@/features/registry'

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale

    // Ensure that the incoming `locale` is valid
    if (!locale || !routing.locales.includes(locale as any)) {
        locale = routing.defaultLocale
    }

    let messages = (await import(`../../../messages/common/${locale}.json`)).default

    // Load messages from enabled features (Lazy Loaded)
    const featureLoaders = Object.values(REGISTRY.features)
    const featureManifests = await Promise.all(featureLoaders.map(loader => loader()))

    for (const feature of featureManifests) {
        if (feature.enabled && feature.messages && feature.messages[locale as any]) {
            const featureMessages = (await feature.messages[locale as any]()).default
            messages = { ...messages, ...featureMessages }
        }
    }

    // Load messages from enabled capabilities (Lazy Loaded)
    const capabilityLoaders = Object.values(REGISTRY.capabilities)
    const capabilityManifests = await Promise.all(capabilityLoaders.map(loader => loader()))

    for (const capability of capabilityManifests) {
        if (capability.enabled && capability.messages && capability.messages[locale as any]) {
            const capMessages = (await capability.messages[locale as any]()).default
            messages = { ...messages, ...capMessages }
        }
    }

    return {
        locale,
        messages
    }
})
