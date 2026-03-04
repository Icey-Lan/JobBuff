'use client';

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import styles from './ToastProvider.module.css';

export type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
    id: string;
    text: string;
    type: ToastType;
}

interface ToastContextValue {
    showToast: (text: string, type?: ToastType, durationMs?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((text: string, type: ToastType = 'info', durationMs = 2600) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setToasts((prev) => [...prev, { id, text, type }]);
        window.setTimeout(() => {
            removeToast(id);
        }, durationMs);
    }, [removeToast]);

    const contextValue = useMemo(() => ({ showToast }), [showToast]);

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            <div className={styles.toastContainer} aria-live="polite" aria-atomic="false">
                {toasts.map((toast) => (
                    <div key={toast.id} className={`${styles.toast} ${styles[`toast--${toast.type}`]}`}>
                        <span className={styles.toastText}>{toast.text}</span>
                        <button
                            type="button"
                            className={styles.toastClose}
                            onClick={() => removeToast(toast.id)}
                            aria-label="关闭提示"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
