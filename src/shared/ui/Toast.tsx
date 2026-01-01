'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { Card } from './Card'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
    id: string
    message: string
    type: ToastType
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const showToast = (message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(7)
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 3000)
    }

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <div key={toast.id} className="pointer-events-auto animate-in slide-in-from-right fade-in duration-300">
                        <Card
                            className={`p-4 shadow-lg min-w-[300px] border-l-4 ${
                                toast.type === 'success'
                                    ? 'border-l-green-500 bg-green-50'
                                    : toast.type === 'error'
                                      ? 'border-l-red-500 bg-red-50'
                                      : 'border-l-blue-500 bg-blue-50'
                            }`}
                        >
                            <p className="text-sm font-medium text-slate-900">{toast.message}</p>
                        </Card>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) throw new Error('useToast must be used within ToastProvider')
    return context
}
