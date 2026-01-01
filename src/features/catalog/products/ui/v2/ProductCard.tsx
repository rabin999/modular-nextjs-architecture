import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card'
import { formatMoney } from '@/shared/utils/money'
import { useTranslations } from 'next-intl'
import { Link } from '@/core/i18n/routing'
import { Product } from '@/features/catalog/types'

export interface ProductCardProps {
    product: Product
    rowActions?: React.ReactNode
    actions?: React.ReactNode
}

export function ProductCard({ product, rowActions }: ProductCardProps) {
    const t = useTranslations('Catalog.card')

    return (
        <Card className="flex flex-row h-48 hover:shadow-md transition-shadow">
            <Link href={`/products/${product.id}`} className="w-48 p-4 flex items-center justify-center bg-white rounded-l-lg shrink-0">
                <img src={product.image} alt={product.title} className="h-full w-auto object-contain" />
            </Link>
            <div className="flex-1 flex flex-col">
                <Link href={`/products/${product.id}`}>
                    <CardHeader>
                        <div className="flex justify-between items-start gap-4">
                            <CardTitle className="text-lg line-clamp-2" title={product.title}>
                                {product.title}
                            </CardTitle>
                            <span className="font-bold text-lg whitespace-nowrap">{formatMoney(product.price)}</span>
                        </div>
                        <div className="text-xs text-blue-600 font-medium uppercase tracking-wider mt-1">{product.category}</div>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                    </CardContent>
                </Link>
                <div className="p-4 pt-0 flex justify-end gap-2">{rowActions}</div>
            </div>
        </Card>
    )
}
