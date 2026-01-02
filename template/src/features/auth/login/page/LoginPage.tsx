'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/shared/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card'
import { useState } from 'react'
import { apiClient } from '@/core/api/client'
import { ENDPOINTS } from '@/core/api/endpoints'
import { LoginResponse, loginResponseSchema } from '@/features/auth/login/contracts/login-response.schema'

export function LoginPage() {
    const t = useTranslations('Auth.Login')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)
        const username = formData.get('username') as string
        const password = formData.get('password') as string

        const res = await apiClient<LoginResponse>(`${ENDPOINTS.BFF_BASE}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            schema: loginResponseSchema,
        })

        if (res.ok) {
            alert(`Logged in as ${res.data.user.username}`)
        } else {
            setError(t('error'))
        }
        setLoading(false)
    }

    return (
        <div className="container mx-auto px-4 py-20 flex justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">{t('title')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('username')}</label>
                            <input
                                type="text"
                                name="username"
                                defaultValue="mor_2314"
                                className="w-full p-2 border rounded-md"
                                placeholder="mor_2314"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('password')}</label>
                            <input
                                type="password"
                                name="password"
                                defaultValue="83r5^_"
                                className="w-full p-2 border rounded-md"
                                placeholder="83r5^_"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? '...' : t('submit')}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
