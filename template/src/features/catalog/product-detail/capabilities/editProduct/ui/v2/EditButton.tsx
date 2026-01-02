'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/shared/ui/Button'
import { apiClient } from '@/core/api/client'
import { ENDPOINTS } from '@/core/api/endpoints'
import { Pencil } from 'lucide-react'

export function EditButton({ productId }: { productId: number | string }) {
    const t = useTranslations('EditCapability')

    const handleEdit = async () => {
        // V2 might use a different endpoint or optimistic UI
        const res = await apiClient(`${ENDPOINTS.BFF_BASE}/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify({ title: 'Updated Title (V2)' }),
        })

        if (res.ok) {
            alert('Product updated (V2 Premium Experience)')
        } else {
            alert('Failed to update product')
        }
    }

    // V2 Design: Primary color, Icon, different label format
    return (
        <Button variant="primary" onClick={handleEdit} className="gap-2">
            <Pencil size={16} />
            {t('action_label')}
        </Button>
    )
}
