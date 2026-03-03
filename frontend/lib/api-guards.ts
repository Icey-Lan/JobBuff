import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase/server';
import { consumeRateLimit } from '@/lib/rate-limit';

type GuardProfile = 'llm' | 'ocr' | 'mutation';

interface GuardLimit {
    limit: number;
    windowMs: number;
}

interface GuardConfig {
    user: GuardLimit;
    ip: GuardLimit;
}

const GUARD_CONFIGS: Record<GuardProfile, GuardConfig> = {
    llm: {
        user: { limit: 15, windowMs: 60_000 },
        ip: { limit: 45, windowMs: 60_000 },
    },
    ocr: {
        user: { limit: 6, windowMs: 60_000 },
        ip: { limit: 18, windowMs: 60_000 },
    },
    mutation: {
        user: { limit: 20, windowMs: 60_000 },
        ip: { limit: 60, windowMs: 60_000 },
    },
};

export interface ApiGuardContext {
    requestId: string;
    userId: string;
    ip: string;
}

export type ApiGuardResult =
    | { ok: true; context: ApiGuardContext }
    | { ok: false; response: NextResponse };

function getClientIp(request: NextRequest): string {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        const ip = forwardedFor.split(',')[0]?.trim();
        if (ip) return ip;
    }

    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp.trim();
    }

    return 'unknown';
}

function getRequestId(request: NextRequest): string {
    return request.headers.get('x-request-id') || crypto.randomUUID();
}

interface ErrorResponseOptions {
    retryAfterSeconds?: number;
}

export function createErrorResponse(
    requestId: string,
    status: number,
    error: string,
    options: ErrorResponseOptions = {}
): NextResponse {
    const headers: Record<string, string> = {
        'x-request-id': requestId,
    };

    if (options.retryAfterSeconds) {
        headers['Retry-After'] = String(options.retryAfterSeconds);
    }

    return NextResponse.json(
        { error, requestId },
        { status, headers }
    );
}

export function createSuccessResponse<T>(
    requestId: string,
    body: T,
    status = 200
): NextResponse {
    return NextResponse.json(body, {
        status,
        headers: {
            'x-request-id': requestId,
        },
    });
}

export async function enforceApiGuard(
    request: NextRequest,
    profile: GuardProfile
): Promise<ApiGuardResult> {
    const requestId = getRequestId(request);
    const ip = getClientIp(request);
    const config = GUARD_CONFIGS[profile];

    const supabase = await createServerSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return {
            ok: false,
            response: createErrorResponse(requestId, 401, 'Unauthorized'),
        };
    }

    const userKey = `user:${profile}:${user.id}`;
    const userLimit = consumeRateLimit(userKey, config.user.limit, config.user.windowMs);
    if (!userLimit.allowed) {
        return {
            ok: false,
            response: createErrorResponse(requestId, 429, 'Too Many Requests', {
                retryAfterSeconds: userLimit.retryAfterSeconds,
            }),
        };
    }

    const ipKey = `ip:${profile}:${ip}`;
    const ipLimit = consumeRateLimit(ipKey, config.ip.limit, config.ip.windowMs);
    if (!ipLimit.allowed) {
        return {
            ok: false,
            response: createErrorResponse(requestId, 429, 'Too Many Requests', {
                retryAfterSeconds: ipLimit.retryAfterSeconds,
            }),
        };
    }

    return {
        ok: true,
        context: {
            requestId,
            userId: user.id,
            ip,
        },
    };
}
