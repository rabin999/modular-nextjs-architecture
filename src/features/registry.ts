/**
 * Central registry for features, capabilities, and configuration
 * Feature IDs match folder structure (e.g. 'catalog-products')
 */
export const REGISTRY = {
    features: {
        'marketing-home': () => import('./marketing/home/manifest').then(m => m.marketingManifest),
        'catalog-products': () => import('./catalog/products/manifest').then(m => m.catalogManifest),
        'catalog-product-detail': () => import('./catalog/product-detail/manifest').then(m => m.productDetailManifest),
        'auth-login': () => import('./auth/login/manifest').then(m => m.authManifest),
        'auth-sso': () => import('./auth/sso/manifest').then(m => m.ssoManifest),
        'cart': () => import('./cart/manifest').then(m => m.cartManifest),
    },
    capabilities: {
        'delete-product': () => import('./catalog/products/capabilities/deleteProduct/manifest').then(m => m.deleteProductCapability),
        'delete-product-detail': () =>
            import('./catalog/products/capabilities/deleteProduct/manifest').then(m => m.deleteProductDetailCapability),
        'edit-product': () => import('./catalog/product-detail/capabilities/editProduct/manifest').then(m => m.editProductCapabilityV1),
        'add-to-cart': () => import('./catalog/product-detail/capabilities/addToCart/manifest').then(m => m.addToCartCapability),
    },
    config: {
        ui: {
            productCard: 'v2',
        },
    },
}
