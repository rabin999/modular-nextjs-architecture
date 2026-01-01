import { ComponentType } from 'react'
import { Product } from '../../types'

// The grid doesn't know about v1/v2, receiving the component as prop
export function ProductGrid({
    products,
    CardComponent,
    actionsRegistry
}: {
    products: Product[],
    CardComponent: ComponentType<{ product: Product, actions?: any }>,
    actionsRegistry: Array<{ slot: string, component: ComponentType<any> }>
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
                // Resolve only the actions for 'rowActions' slot
                const rowActions = actionsRegistry
                    .filter(cap => cap.slot === 'rowActions')
                    .map((cap, idx) => {
                        const ActionComponent = cap.component
                        return <ActionComponent key={`${cap.slot}-${idx}`} productId={product.id} />
                    })

                return (
                    <div key={product.id} className="h-full">
                        <CardComponent
                            product={product}
                            actions={rowActions}
                        />
                    </div>
                )
            })}
        </div>
    )
}
