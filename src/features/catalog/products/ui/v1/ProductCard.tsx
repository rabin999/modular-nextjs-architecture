import { Link } from '@/core/i18n/routing'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card'
import { formatMoney } from '@/shared/utils/money'
import { useTranslations } from 'next-intl'
import { Product } from '@/features/catalog/types'

export interface ProductCardProps {
    product: Product
    rowActions?: React.ReactNode
    actions?: React.ReactNode // Alias for flexibility
}

export function ProductCard({ product, rowActions }: ProductCardProps) {
    const t = useTranslations('Catalog.card')

    return (
        <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
            <Link href={`/products/${product.id}`} className="flex-1 flex flex-col">
                <div className="h-48 p-4 flex items-center justify-center bg-white rounded-t-lg">
                    <img
                        src={product.image}
                        alt={product.title}
                        className="h-full w-auto object-contain"
                    />
                </div>
                <CardHeader>
                    <CardTitle className="text-lg line-clamp-1" title={product.title}>
                        {product.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                    <p className="text-sm text-gray-500 line-clamp-3">{product.description}</p>
                    <div className="mt-4 font-bold text-lg">{formatMoney(product.price)}</div>
                </CardContent>
            </Link>
            <div className="p-4 border-t border-slate-100 flex justify-end gap-2">
                {rowActions}
            </div>
        </Card>
    )
}
