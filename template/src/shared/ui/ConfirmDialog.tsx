'use client'

import { Button } from './Button'
import { Card, CardHeader, CardTitle, CardContent } from './Card'

interface ConfirmDialogProps {
    open: boolean
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'primary'
    onConfirm: () => void
    onCancel: () => void
    isLoading?: boolean
}

export function ConfirmDialog({
    open,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'primary',
    onConfirm,
    onCancel,
    isLoading,
}: ConfirmDialogProps) {
    if (!open) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <Card className="w-full max-w-md shadow-2xl mx-4">
                <CardHeader>
                    <CardTitle className="text-xl">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-600 mb-6">{description}</p>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
                            {cancelText}
                        </Button>
                        <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} disabled={isLoading}>
                            {isLoading ? '...' : confirmText}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
