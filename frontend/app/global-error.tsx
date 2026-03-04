'use client';

import { useEffect } from 'react';
import { RetroButton } from '@/components/ui/RetroButton';
import styles from './error.module.css';

interface GlobalErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
    useEffect(() => {
        console.error('Global error boundary caught:', error);
    }, [error]);

    return (
        <html lang="zh-CN">
            <body>
                <div className={styles['error-shell']}>
                    <div className={styles['error-card']}>
                        <h2 className={styles['error-title']}>应用启动失败</h2>
                        <p className={styles['error-subtitle']}>
                            应用根节点发生错误，建议先重试；如果持续出现，请刷新浏览器后再试。
                        </p>
                        {error.digest && (
                            <div className={styles['error-debug']}>
                                Error Digest: {error.digest}
                            </div>
                        )}
                        <div className={styles['error-actions']}>
                            <RetroButton variant="danger" onClick={reset}>
                                重试应用
                            </RetroButton>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
}
