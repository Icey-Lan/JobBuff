'use client';

import { useEffect } from 'react';

/**
 * 全局错误抑制器
 * 用于静默 Supabase SDK 在 React 18 StrictMode 下产生的 AbortError
 * 这是一个已知的兼容性问题，不影响功能
 */
export function AbortErrorSuppressor() {
    useEffect(() => {
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            // 检查是否是 AbortError
            if (
                event.reason instanceof Error &&
                (event.reason.name === 'AbortError' ||
                    event.reason.message?.includes('aborted'))
            ) {
                // 阻止默认的错误日志输出
                event.preventDefault();
                // 可选：输出调试信息
                if (process.env.NODE_ENV === 'development') {
                    console.debug('[AbortErrorSuppressor] Suppressed AbortError from Supabase SDK');
                }
            }
        };

        window.addEventListener('unhandledrejection', handleUnhandledRejection);

        return () => {
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
        };
    }, []);

    return null;
}
