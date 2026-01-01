// Single source of truth for features, capabilities, and versions
// Strict Naming Convention: 
// - Feature IDs should match folder structure (e.g. 'catalog-products') to prevent confusion
// - Capability IDs should be unique
export const REGISTRY = {
    // 🚀 Lazy-loaded Feature Map
    features: {
        'marketing-home': () => import('./marketing/home/manifest').then(m => m.marketingManifest),
        'catalog-products': () => import('./catalog/products/manifest').then(m => m.catalogManifest),
        'catalog-product-detail': () => import('./catalog/product-detail/manifest').then(m => m.productDetailManifest),
        'auth-login': () => import('./auth/login/manifest').then(m => m.authManifest),
    },
    // 🚀 Lazy-loaded Capability Map
    capabilities: {
        'delete-product': () => import('./catalog/products/capabilities/deleteProduct/manifest').then(m => m.deleteProductCapability),
        'delete-product-detail': () => import('./catalog/products/capabilities/deleteProduct/manifest').then(m => m.deleteProductDetailCapability),
        'edit-product': () => import('./catalog/product-detail/capabilities/editProduct/manifest').then(m => m.editProductCapabilityV1), // Legacy
        // 'edit-product': () => import('./catalog/product-detail/capabilities/editProduct/manifest').then(m => m.editProductCapabilityV2), // Current (uncomment to switch)
    },
    config: {
        ui: {
            productCard: 'v2', // Switch to 'v1' here to downgrade
        }
    }
}
