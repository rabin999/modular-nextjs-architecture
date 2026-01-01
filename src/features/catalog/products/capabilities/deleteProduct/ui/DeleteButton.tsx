'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/shared/ui/Button'
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { useToast } from '@/shared/ui/Toast'
import { deleteProductUseCase } from '../usecase'

export function DeleteButton({ productId }: { productId: number }) {
    const t = useTranslations('DeleteCapability')
    const tCommon = useTranslations('Common')
    const [isPending, startTransition] = useTransition()
    const [showConfirm, setShowConfirm] = useState(false)
    const { showToast } = useToast()
    const router = useRouter()

    const handleDelete = async () => {
        startTransition(async () => {
            try {
                const res = await deleteProductUseCase(productId)
                if (res.ok) {
                    showToast('Product deleted successfully', 'success')
                    router.refresh()
                } else {
                    throw new Error('Failed to delete')
                }
            } catch (error) {
                showToast(tCommon('error'), 'error')
            } finally {
                setShowConfirm(false)
            }
        })
    }

    return (
        <>
            <Button
                variant="danger"
                size="sm"
                onClick={() => setShowConfirm(true)}
                disabled={isPending}
            >
                {t('delete_btn')}
            </Button>

            <ConfirmDialog
                open={showConfirm}
                title={t('confirm_title')}
                description={t('confirm_desc')}
                confirmText={t('delete_btn')}
                cancelText={t('canceling').replace('...', '')} // Reuse existing string or add 'cancel'
                variant="danger"
                isLoading={isPending}
                onConfirm={handleDelete}
                onCancel={() => setShowConfirm(false)}
            />
        </>
    )
}
