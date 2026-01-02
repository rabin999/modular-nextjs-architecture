import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock next-intl
vi.mock('next-intl', () => ({
    useTranslations: () => (key: string) => {
        const translations: Record<string, string> = {
            delete_btn: 'Delete',
            confirm_title: 'Confirm Delete',
            confirm_desc: 'Are you sure you want to delete this product?',
            canceling: 'Cancel',
            error: 'An error occurred',
        }
        return translations[key] || key
    },
}))

// Mock Next.js router
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: vi.fn(),
        push: vi.fn(),
    }),
}))

// Mock the Button component
vi.mock('@/shared/ui/Button', () => ({
    Button: ({ children, onClick, variant, disabled, ...props }: any) => (
        <button onClick={onClick} data-variant={variant} disabled={disabled} {...props}>
            {children}
        </button>
    ),
}))

// Mock the ConfirmDialog component
vi.mock('@/shared/ui/ConfirmDialog', () => ({
    ConfirmDialog: ({ open, title, onConfirm, onCancel, confirmText }: any) =>
        open ? (
            <div data-testid="confirm-dialog">
                <p>{title}</p>
                <button onClick={onConfirm}>{confirmText}</button>
                <button onClick={onCancel}>Cancel</button>
            </div>
        ) : null,
}))

// Mock the Toast hook
const mockShowToast = vi.fn()
vi.mock('@/shared/ui/Toast', () => ({
    useToast: () => ({
        showToast: mockShowToast,
    }),
}))

// Mock the usecase
const mockDeleteUseCase = vi.fn()
vi.mock('../usecase', () => ({
    deleteProductUseCase: (...args: any[]) => mockDeleteUseCase(...args),
}))

// Import after mocks
import { DeleteButton } from '../ui/DeleteButton'

describe('DeleteButton', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockDeleteUseCase.mockResolvedValue({ ok: true })
    })

    it('should render with correct text', () => {
        render(<DeleteButton productId={1} />)

        expect(screen.getByRole('button')).toBeInTheDocument()
        expect(screen.getByText('Delete')).toBeInTheDocument()
    })

    it('should have danger variant', () => {
        render(<DeleteButton productId={1} />)

        expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'danger')
    })

    it('should show confirmation dialog when clicked', async () => {
        const user = userEvent.setup()

        render(<DeleteButton productId={1} />)

        expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument()

        await user.click(screen.getByText('Delete'))

        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
    })

    it('should call delete use case when confirmed', async () => {
        const user = userEvent.setup()

        render(<DeleteButton productId={42} />)

        // Open dialog
        await user.click(screen.getByText('Delete'))

        // Click confirm in dialog
        await user.click(screen.getAllByText('Delete')[1]) // Second Delete button is in dialog

        await waitFor(() => {
            expect(mockDeleteUseCase).toHaveBeenCalledWith(42)
        })
    })

    it('should show success toast on successful delete', async () => {
        const user = userEvent.setup()

        render(<DeleteButton productId={1} />)

        await user.click(screen.getByText('Delete'))
        await user.click(screen.getAllByText('Delete')[1])

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith('Product deleted successfully', 'success')
        })
    })

    it('should show error toast on failed delete', async () => {
        mockDeleteUseCase.mockResolvedValue({ ok: false })
        const user = userEvent.setup()

        render(<DeleteButton productId={1} />)

        await user.click(screen.getByText('Delete'))
        await user.click(screen.getAllByText('Delete')[1])

        await waitFor(() => {
            expect(mockShowToast).toHaveBeenCalledWith('An error occurred', 'error')
        })
    })

    it('should close dialog when cancelled', async () => {
        const user = userEvent.setup()

        render(<DeleteButton productId={1} />)

        await user.click(screen.getByText('Delete'))
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()

        await user.click(screen.getByText('Cancel'))

        expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument()
    })
})
