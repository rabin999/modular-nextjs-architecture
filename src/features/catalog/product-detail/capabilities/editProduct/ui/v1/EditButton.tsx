'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/shared/ui/Button'
import { apiClient } from '@/core/api/client'
import { ENDPOINTS } from '@/core/api/endpoints'

export function EditButton({ productId }: { productId: number | string }) {
    const t = useTranslations('EditCapability')

    const handleEdit = async () => {
        // For verify "proper api calls", we trigger a mock update
        const res = await apiClient(`${ENDPOINTS.BFF_BASE}/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify({ title: 'Updated Title (Mock)' }),
        })

        if (res.ok) {
            alert('Product updated successfully (Mock API Call) - V1')
            // In real app: navigate to edit page or open modal
        } else {
            alert('Failed to update product')
        }
    }

    return (
        <Button variant="outline" onClick={handleEdit}>
            {t('action_label')} (v1)
        </Button>
    )
}
