import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const redirect = searchParams.get('redirect') || '/';

    console.log('Auth Callback received:', {
        code: code ? 'present' : 'missing',
        error,
        errorDescription,
        redirect,
        fullUrl: request.url
    });

    // Handle error from Supabase
    if (error) {
        console.error('Auth error from Supabase:', error, errorDescription);
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDescription || error)}`);
    }

    if (code) {
        const cookieStore = await cookies();

        // DEBUG: 打印所有收到的 cookies
        const existingCookies = cookieStore.getAll();
        console.log('Existing cookies at callback:', existingCookies.map(c => ({ name: c.name, len: c.value?.length })));

        // 收集需要设置的 cookies
        const cookiesToSet: { name: string; value: string; options: CookieOptions }[] = [];

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        const all = cookieStore.getAll();
                        console.log('getAll called, returning', all.length, 'cookies');
                        return all;
                    },
                    setAll(cookies) {
                        console.log('setAll called with', cookies.length, 'cookies:', cookies.map(c => c.name));
                        cookies.forEach((cookie) => {
                            cookiesToSet.push(cookie);
                        });
                    },
                },
            }
        );


        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        console.log('Token exchange result:', {
            success: !exchangeError,
            userId: data?.user?.id,
            error: exchangeError?.message,
            cookiesCount: cookiesToSet.length
        });

        if (!exchangeError) {
            // 创建 redirect response 并手动设置 cookies
            const response = NextResponse.redirect(`${origin}${redirect}`);

            // 将所有 auth cookies 设置到 response 上
            cookiesToSet.forEach(({ name, value, options }) => {
                response.cookies.set(name, value, options);
            });

            console.log('Cookies set on response:', cookiesToSet.map(c => c.name));

            return response;
        }

        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(exchangeError.message)}`);
    }

    // No code provided
    return NextResponse.redirect(`${origin}/login?error=no_code`);
}
