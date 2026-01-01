'use client'

import { useEffect } from 'react'
import { Button } from '@/shared/ui/Button'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="container mx-auto px-4 py-20 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
            <p className="text-slate-600 mb-6">{error.message}</p>
            <Button onClick={reset}>Try again</Button>
        </div>
    )
}
