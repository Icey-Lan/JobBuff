'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RetroButton } from '@/components/ui/RetroButton';
import styles from './error.module.css';

interface ErrorPageProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
    useEffect(() => {
        console.error('App route error boundary caught:', error);
    }, [error]);

    return (
        <div className={styles['error-shell']}>
            <div className={styles['error-card']}>
                <h2 className={styles['error-title']}>系统暂时失去响应</h2>
                <p className={styles['error-subtitle']}>
                    页面运行出现异常。你可以先重试当前页面，或返回任务列表继续操作。
                </p>
                {error.digest && (
                    <div className={styles['error-debug']}>
                        Error Digest: {error.digest}
                    </div>
                )}
                <div className={styles['error-actions']}>
                    <RetroButton variant="primary" onClick={reset}>
                        重新加载当前页
                    </RetroButton>
                    <Link href="/log">
                        <RetroButton variant="secondary">返回任务日志</RetroButton>
                    </Link>
                </div>
            </div>
        </div>
    );
}
