import { createServerSupabase } from '@/lib/supabase/server';
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
        const supabase = await createServerSupabase();
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        console.log('Token exchange result:', {
            success: !exchangeError,
            userId: data?.user?.id,
            error: exchangeError?.message
        });

        if (!exchangeError) {
            return NextResponse.redirect(`${origin}${redirect}`);
        }

        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(exchangeError.message)}`);
    }

    // No code provided
    return NextResponse.redirect(`${origin}/login?error=no_code`);
}

