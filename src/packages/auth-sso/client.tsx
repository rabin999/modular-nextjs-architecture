
'use client'

import { useEffect, useState } from 'react'
import type { SessionPayload } from './types'

/**
 * Client-side hook to get the current user session
 * Uses SWR pattern for automatic revalidation
 */
export function useSession() {
    const [session, setSession] = useState<SessionPayload | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        fetch('/api/auth/session')
            .then(async (res) => {
                if (res.ok) {
                    const data = await res.json()
                    setSession(data.user)
                } else {
                    setSession(null)
                }
            })
            .catch((err) => {
                setError(err)
                setSession(null)
            })
            .finally(() => {
                setLoading(false)
            })
    }, [])

    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        setSession(null)
        window.location.href = '/'
    }

    return { session, loading, error, logout }
}
