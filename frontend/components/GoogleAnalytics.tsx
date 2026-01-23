'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { GA_MEASUREMENT_ID, pageview } from '@/lib/analytics';

// 路由变化追踪组件
function RouteChangeTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (pathname && GA_MEASUREMENT_ID) {
            const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
            pageview(url);
        }
    }, [pathname, searchParams]);

    return null;
}

// Google Analytics 主组件
export function GoogleAnalytics() {
    // 如果没有配置 GA ID，不渲染任何内容
    if (!GA_MEASUREMENT_ID) {
        return null;
    }

    return (
        <>
            {/* Google Analytics 脚本 */}
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <Script
                id="google-analytics"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${GA_MEASUREMENT_ID}', {
                            page_path: window.location.pathname,
                            cookie_flags: 'SameSite=None;Secure',
                        });
                    `,
                }}
            />
            {/* 路由变化追踪 */}
            <Suspense fallback={null}>
                <RouteChangeTracker />
            </Suspense>
        </>
    );
}

export default GoogleAnalytics;
