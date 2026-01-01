import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const translations: Record<string, string> = {
            'action_label': 'Edit',
        }
        return translations[key] || key
    },
}))

// Mock the Button component
vi.mock('@/shared/ui/Button', () => ({
    Button: ({ children, onClick, variant, ...props }: any) => (
        <button onClick={onClick} data-variant={variant} {...props}>
            {children}
        </button>
    ),
}))

// Mock API client
const mockApiClient = vi.fn()
vi.mock('@/core/api/client', () => ({
    apiClient: (...args: any[]) => mockApiClient(...args),
}))

vi.mock('@/core/api/endpoints', () => ({
    ENDPOINTS: {
        BFF_BASE: '/api/bff',
    },
}))

// Import after mocks
import { EditButton } from '../ui/v1/EditButton'

describe('EditButton V1', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockApiClient.mockResolvedValue({ ok: true, data: {} })
    })

    it('should render with correct text', () => {
        render(<EditButton productId={1} />)

        expect(screen.getByRole('button')).toBeInTheDocument()
        expect(screen.getByText(/Edit/)).toBeInTheDocument()
    })

    it('should have outline variant', () => {
        render(<EditButton productId={1} />)

        expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'outline')
    })

    it('should call API when clicked', async () => {
        const user = userEvent.setup()

        render(<EditButton productId={42} />)

        await user.click(screen.getByRole('button'))

        expect(mockApiClient).toHaveBeenCalledWith(
            '/api/bff/products/42',
            expect.objectContaining({
                method: 'PUT',
            })
        )
    })

    it('should show success alert on successful update', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { })
        const user = userEvent.setup()

        render(<EditButton productId={1} />)

        await user.click(screen.getByRole('button'))

        await vi.waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('successfully'))
        })

        alertSpy.mockRestore()
    })

    it('should show error alert on failed update', async () => {
        mockApiClient.mockResolvedValue({ ok: false, error: { message: 'Failed' } })
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { })
        const user = userEvent.setup()

        render(<EditButton productId={1} />)

        await user.click(screen.getByRole('button'))

        await vi.waitFor(() => {
            expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Failed'))
        })

        alertSpy.mockRestore()
    })
})
