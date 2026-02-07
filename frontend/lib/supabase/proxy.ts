import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    console.log('[Middleware] setAll called with', cookiesToSet.length, 'cookies:', cookiesToSet.map(c => c.name));
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // 只刷新 session，不做任何重定向
    // 重要：这会确保 OAuth 回调后的 cookies 被正确设置
    await supabase.auth.getUser();

    // DEBUG: 打印最终 response 中设置的所有 cookies
    const responseCookies = supabaseResponse.cookies.getAll();
    if (responseCookies.length > 0) {
        console.log('[Middleware] Response cookies being sent:', responseCookies.map(c => ({ name: c.name, len: c.value?.length })));
    }

    return supabaseResponse;
}
