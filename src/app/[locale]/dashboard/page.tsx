
import { getCurrentUser } from '@/packages/auth-sso'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const user = await getCurrentUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
                Welcome to Dashboard
            </h1>

            <div style={{ marginTop: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    User Session Data:
                </h3>
                <pre style={{
                    background: '#1a1a1a',
                    color: '#0f0',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    overflow: 'auto',
                    fontSize: '0.875rem',
                    border: '1px solid #333'
                }}>
                    {JSON.stringify(user, null, 2)}
                </pre>
            </div>
        </div>
    )
}
