'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import styles from './ConfirmProvider.module.css';

interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
}

interface ConfirmState {
    open: boolean;
    options: ConfirmOptions;
}

interface ConfirmContextValue {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

interface ConfirmRequest {
    options: ConfirmOptions;
    resolve: (result: boolean) => void;
}

const defaultOptions: ConfirmOptions = {
    title: '请确认操作',
    message: '',
    confirmText: '确认',
    cancelText: '取消',
    danger: false,
};

const ConfirmContext = createContext<ConfirmContextValue | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const resolverRef = useRef<((result: boolean) => void) | null>(null);
    const queueRef = useRef<ConfirmRequest[]>([]);
    const [state, setState] = useState<ConfirmState>({
        open: false,
        options: defaultOptions,
    });

    const openNext = useCallback(() => {
        if (resolverRef.current) {
            return;
        }

        const next = queueRef.current.shift();
        if (!next) {
            setState((prev) => ({ ...prev, open: false }));
            return;
        }

        resolverRef.current = next.resolve;
        setState({
            open: true,
            options: {
                ...defaultOptions,
                ...next.options,
            },
        });
    }, []);

    const closeWith = useCallback((result: boolean) => {
        const resolve = resolverRef.current;
        resolverRef.current = null;
        setState((prev) => ({ ...prev, open: false }));
        if (resolve) {
            resolve(result);
        }
        queueMicrotask(() => {
            openNext();
        });
    }, [openNext]);

    const confirm = useCallback((options: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            queueRef.current.push({ options, resolve });
            openNext();
        });
    }, [openNext]);

    useEffect(() => {
        return () => {
            const activeResolve = resolverRef.current;
            resolverRef.current = null;
            if (activeResolve) {
                activeResolve(false);
            }

            const queued = queueRef.current;
            queueRef.current = [];
            queued.forEach((request) => request.resolve(false));
        };
    }, []);

    const contextValue = useMemo(() => ({ confirm }), [confirm]);

    return (
        <ConfirmContext.Provider value={contextValue}>
            {children}
            {state.open && (
                <div className={styles.overlay} role="dialog" aria-modal="true">
                    <div className={styles.dialog}>
                        <h3 className={styles.title}>{state.options.title}</h3>
                        <p className={styles.message}>{state.options.message}</p>
                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={styles.cancelBtn}
                                onClick={() => closeWith(false)}
                            >
                                {state.options.cancelText}
                            </button>
                            <button
                                type="button"
                                className={`${styles.confirmBtn} ${state.options.danger ? styles['confirmBtn--danger'] : ''}`}
                                onClick={() => closeWith(true)}
                            >
                                {state.options.confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within ConfirmProvider');
    }
    return context;
}
