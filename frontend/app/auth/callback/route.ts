import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const redirectPath = (searchParams.get('redirect') || '/').startsWith('/')
        ? (searchParams.get('redirect') || '/')
        : '/';

    // Handle error from Supabase
    if (error) {
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorDescription || error)}`);
    }

    if (!code) {
        return NextResponse.redirect(`${origin}/login?error=no_code`);
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.redirect(`${origin}/login?error=service_unavailable`);
    }

    const cookieStore = await cookies();
    const cookiesToSet: { name: string; value: string; options: CookieOptions }[] = [];
    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(newCookies) {
                    newCookies.forEach((cookie) => {
                        cookiesToSet.push(cookie);
                    });
                },
            },
        }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(exchangeError.message)}`);
    }

    const response = NextResponse.redirect(`${origin}${redirectPath}`);
    cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
    });
    return response;
}
