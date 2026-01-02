/**
 * Lists all registered features and capabilities from the registry
 */

import { REGISTRY } from '../src/features/registry'

console.log('📦 Enterprise App Inventory')
console.log('===========================\n')

console.log('✅ Registered Features:')
Object.entries(REGISTRY.features).forEach(([id, loader]) => {
    console.log(`  - ${id}`)
    console.log(`    └─ Loader: ${typeof loader === 'function' ? 'lazy-loaded ✓' : 'static'}`)
})

console.log('\n🔌 Registered Capabilities:')
Object.entries(REGISTRY.capabilities).forEach(([id, loader]) => {
    console.log(`  - ${id}`)
    console.log(`    └─ Loader: ${typeof loader === 'function' ? 'lazy-loaded ✓' : 'static'}`)
})

console.log('\n🎨 UI Configuration:')
console.log(JSON.stringify(REGISTRY.config, null, 2))

console.log('\n===========================')
console.log(`Total Features: ${Object.keys(REGISTRY.features).length}`)
console.log(`Total Capabilities: ${Object.keys(REGISTRY.capabilities).length}`)
console.log('===========================\n')
