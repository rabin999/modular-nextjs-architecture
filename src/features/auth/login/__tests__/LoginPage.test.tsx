import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const translations: Record<string, string> = {
            'title': 'Sign In',
            'username': 'Username',
            'password': 'Password',
            'submit': 'Login',
            'error': 'Login failed. Please try again.',
        }
        return translations[key] || key
    },
}))

// Mock UI components
vi.mock('@/shared/ui/Button', () => ({
    Button: ({ children, onClick, disabled, type, className, ...props }: any) => (
        <button onClick={onClick} disabled={disabled} type={type} className={className} {...props}>
            {children}
        </button>
    ),
}))

vi.mock('@/shared/ui/Card', () => ({
    Card: ({ children, className }: any) => <div className={className}>{children}</div>,
    CardHeader: ({ children }: any) => <div>{children}</div>,
    CardTitle: ({ children, className }: any) => <h2 className={className}>{children}</h2>,
    CardContent: ({ children }: any) => <div>{children}</div>,
}))

// Mock API client
const mockApiClient = vi.fn()
vi.mock('@/core/api/client', () => ({
    apiClient: (url: string, options: any) => mockApiClient(url, options),
}))

vi.mock('@/core/api/endpoints', () => ({
    ENDPOINTS: {
        BFF_BASE: '/api/bff',
    },
}))

// Import after mocks
import { LoginPage } from '../page/LoginPage'

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockApiClient.mockResolvedValue({
            ok: true,
            data: {
                token: 'mock-token',
                user: { username: 'testuser' },
            },
        })
    })

    it('should render login form', () => {
        render(<LoginPage />)

        expect(screen.getByText('Sign In')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('mor_2314')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('83r5^_')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
    })

    it('should have default values in form fields', () => {
        render(<LoginPage />)

        const usernameInput = screen.getByPlaceholderText('mor_2314')
        const passwordInput = screen.getByPlaceholderText('83r5^_')

        expect(usernameInput).toHaveValue('mor_2314')
        expect(passwordInput).toHaveValue('83r5^_')
    })

    it('should submit form with credentials', async () => {
        const user = userEvent.setup()
        render(<LoginPage />)

        const usernameInput = screen.getByPlaceholderText('mor_2314')
        const passwordInput = screen.getByPlaceholderText('83r5^_')

        await user.clear(usernameInput)
        await user.type(usernameInput, 'newuser')
        await user.clear(passwordInput)
        await user.type(passwordInput, 'newpass')

        await user.click(screen.getByRole('button', { name: /login/i }))

        expect(mockApiClient).toHaveBeenCalledWith(
            '/api/bff/auth/login',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ username: 'newuser', password: 'newpass' }),
            })
        )
    })

    it('should show loading state during submission', async () => {
        const user = userEvent.setup()

        // Make API call hang
        mockApiClient.mockImplementation(() => new Promise(() => { }))

        render(<LoginPage />)

        await user.click(screen.getByRole('button', { name: /login/i }))

        expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should show error message on failed login', async () => {
        const user = userEvent.setup()
        mockApiClient.mockResolvedValue({
            ok: false,
            error: { message: 'Invalid credentials' },
        })

        render(<LoginPage />)

        await user.click(screen.getByRole('button', { name: /login/i }))

        await waitFor(() => {
            expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument()
        })
    })

    it('should show success alert on successful login', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { })
        const user = userEvent.setup()

        render(<LoginPage />)

        await user.click(screen.getByRole('button', { name: /login/i }))

        await waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith('Logged in as testuser')
        })

        alertSpy.mockRestore()
    })
})
