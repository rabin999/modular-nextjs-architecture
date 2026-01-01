import { ComponentType, LazyExoticComponent } from 'react'

export interface FeatureManifest {
    id: string
    name: string
    enabled: boolean
    components?: Record<string, ComponentType<any> | LazyExoticComponent<any>>
    // Mapping locale to import promise
    messages?: Record<string, () => Promise<any>>
}

export interface CapabilityManifest {
    id: string
    description: string
    enabled: boolean
    slot: string
    component: ComponentType<any> | LazyExoticComponent<any>
    messages?: Record<string, () => Promise<any>>
}
