import { NextRequest } from 'next/server';
import { createErrorResponse, createSuccessResponse, enforceApiGuard } from '@/lib/api-guards';
import { createServerSupabase } from '@/lib/supabase/server';
import { SchemaValidationError, validateIntelResponse } from '@/lib/runtime-validators';

interface CreateQuestRequest {
    jd_text: string;
    resume_text: string;
    target_position?: string;
    target_salary?: string;
    intel: unknown;
    idempotency_key?: string;
}

interface UserQuotaRow {
    free_quota: number;
    used_quota: number;
    is_premium: boolean;
}

interface QuestSummary {
    id: string;
    created_at: string;
}

interface IdempotencyRecord {
    status: 'in_progress' | 'succeeded';
    updatedAt: number;
    response?: {
        quest: QuestSummary;
        quota: {
            freeQuota: number;
            usedQuota: number;
            remaining: number;
            isPremium: boolean;
        };
    };
}

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;
const idempotencyStore = new Map<string, IdempotencyRecord>();

function cleanupIdempotencyStore(now: number) {
    for (const [key, value] of idempotencyStore.entries()) {
        if (now - value.updatedAt > IDEMPOTENCY_TTL_MS) {
            idempotencyStore.delete(key);
        }
    }
}

function isQuotaRow(value: unknown): value is UserQuotaRow {
    return (
        typeof value === 'object' &&
        value !== null &&
        typeof (value as UserQuotaRow).free_quota === 'number' &&
        typeof (value as UserQuotaRow).used_quota === 'number' &&
        typeof (value as UserQuotaRow).is_premium === 'boolean'
    );
}

async function getOrCreateQuota(userId: string) {
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
        .from('user_quotas')
        .select('free_quota, used_quota, is_premium')
        .eq('id', userId)
        .single();

    if (!error && isQuotaRow(data)) {
        return { quota: data, error: null };
    }

    if (error?.code !== 'PGRST116') {
        return { quota: null, error };
    }

    const { data: inserted, error: insertError } = await supabase
        .from('user_quotas')
        .insert({
            id: userId,
            free_quota: 10,
            used_quota: 0,
            is_premium: false,
        })
        .select('free_quota, used_quota, is_premium')
        .single();

    if (insertError || !isQuotaRow(inserted)) {
        return { quota: null, error: insertError ?? new Error('Failed to initialize quota') };
    }

    return { quota: inserted, error: null };
}

export async function POST(request: NextRequest) {
    const guard = await enforceApiGuard(request, 'mutation');
    if (!guard.ok) {
        return guard.response;
    }
    const { requestId, userId } = guard.context;
    let storeKey: string | null = null;

    try {
        const body = await request.json() as CreateQuestRequest;

        if (!body.jd_text?.trim() || !body.resume_text?.trim()) {
            return createErrorResponse(requestId, 400, 'Missing required fields: jd_text and resume_text');
        }

        const idempotencyKey = body.idempotency_key?.trim();
        if (!idempotencyKey) {
            return createErrorResponse(requestId, 400, 'Missing idempotency_key');
        }
        if (idempotencyKey.length > 128) {
            return createErrorResponse(requestId, 400, 'Invalid idempotency_key');
        }

        const intel = validateIntelResponse(body.intel);
        const targetPosition = body.target_position?.trim() || null;
        const targetSalary = body.target_salary?.trim() || null;
        storeKey = `${userId}:${idempotencyKey}`;
        const now = Date.now();
        cleanupIdempotencyStore(now);

        const existingRecord = idempotencyStore.get(storeKey);
        if (existingRecord?.status === 'succeeded' && existingRecord.response) {
            return createSuccessResponse(requestId, existingRecord.response);
        }
        if (existingRecord?.status === 'in_progress') {
            return createErrorResponse(requestId, 409, 'Request already in progress');
        }

        idempotencyStore.set(storeKey, {
            status: 'in_progress',
            updatedAt: now,
        });

        const supabase = await createServerSupabase();

        const { data: existingQuest, error: existingQuestError } = await supabase
            .from('quests')
            .select('id, created_at')
            .eq('user_id', userId)
            .contains('diff_status', { __create_idempotency_key: idempotencyKey })
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (existingQuestError) {
            console.error(`[${requestId}] Failed to query idempotent quest:`, existingQuestError);
            idempotencyStore.delete(storeKey);
            return createErrorResponse(requestId, 500, 'Failed to verify duplicate request');
        } else if (existingQuest?.id) {
            const { quota, error: quotaForReplayError } = await getOrCreateQuota(userId);
            if (quotaForReplayError || !quota) {
                idempotencyStore.delete(storeKey);
                return createErrorResponse(requestId, 500, 'Failed to read quota');
            }

            const replayResponse = {
                quest: {
                    id: existingQuest.id,
                    created_at: existingQuest.created_at,
                },
                quota: {
                    freeQuota: quota.free_quota,
                    usedQuota: quota.used_quota,
                    remaining: quota.free_quota - quota.used_quota,
                    isPremium: quota.is_premium,
                },
            };
            idempotencyStore.set(storeKey, {
                status: 'succeeded',
                updatedAt: Date.now(),
                response: replayResponse,
            });
            return createSuccessResponse(requestId, replayResponse);
        }

        const { quota, error: quotaError } = await getOrCreateQuota(userId);

        if (quotaError || !quota) {
            console.error(`[${requestId}] Failed to load quota:`, quotaError);
            idempotencyStore.delete(storeKey);
            return createErrorResponse(requestId, 500, 'Failed to read quota');
        }

        const remainingBefore = quota.free_quota - quota.used_quota;
        if (remainingBefore <= 0) {
            idempotencyStore.delete(storeKey);
            return createErrorResponse(requestId, 409, 'Quota exceeded');
        }

        const reservedUsedQuota = quota.used_quota + 1;
        const { data: reservedQuota, error: reserveError } = await supabase
            .from('user_quotas')
            .update({ used_quota: reservedUsedQuota })
            .eq('id', userId)
            .eq('used_quota', quota.used_quota)
            .select('free_quota, used_quota, is_premium')
            .single();

        if (reserveError || !isQuotaRow(reservedQuota)) {
            console.error(`[${requestId}] Failed to reserve quota:`, reserveError);
            idempotencyStore.delete(storeKey);
            return createErrorResponse(requestId, 409, 'Quota changed, please retry');
        }

        const { data: questRow, error: questError } = await supabase
            .from('quests')
            .insert({
                user_id: userId,
                jd_text: body.jd_text,
                resume_text: body.resume_text,
                target_position: targetPosition,
                target_salary: targetSalary,
                intel,
                diff_status: { __create_idempotency_key: idempotencyKey },
                status: 'intel',
            })
            .select('id, created_at')
            .single();

        if (questError || !questRow?.id) {
            console.error(`[${requestId}] Quest creation failed, starting quota rollback:`, questError);
            const { data: recoveredQuest, error: recoveredQuestError } = await supabase
                .from('quests')
                .select('id, created_at')
                .eq('user_id', userId)
                .contains('diff_status', { __create_idempotency_key: idempotencyKey })
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (recoveredQuestError) {
                console.error(`[${requestId}] Failed to re-check quest after insert error:`, recoveredQuestError);
            } else if (recoveredQuest?.id) {
                const recoveredResponse = {
                    quest: {
                        id: recoveredQuest.id,
                        created_at: recoveredQuest.created_at,
                    },
                    quota: {
                        freeQuota: reservedQuota.free_quota,
                        usedQuota: reservedQuota.used_quota,
                        remaining: reservedQuota.free_quota - reservedQuota.used_quota,
                        isPremium: reservedQuota.is_premium,
                    },
                };
                idempotencyStore.set(storeKey, {
                    status: 'succeeded',
                    updatedAt: Date.now(),
                    response: recoveredResponse,
                });
                return createSuccessResponse(requestId, recoveredResponse);
            }

            const { error: rollbackError } = await supabase
                .from('user_quotas')
                .update({ used_quota: quota.used_quota })
                .eq('id', userId)
                .eq('used_quota', reservedUsedQuota);
            if (rollbackError) {
                console.error(`[${requestId}] Failed to rollback quota after quest creation failure:`, rollbackError);
            }

            idempotencyStore.delete(storeKey);
            return createErrorResponse(requestId, 500, 'Failed to create quest');
        }

        const successResponse = {
            quest: {
                id: questRow.id,
                created_at: questRow.created_at,
            },
            quota: {
                freeQuota: reservedQuota.free_quota,
                usedQuota: reservedQuota.used_quota,
                remaining: reservedQuota.free_quota - reservedQuota.used_quota,
                isPremium: reservedQuota.is_premium,
            },
        };

        idempotencyStore.set(storeKey, {
            status: 'succeeded',
            updatedAt: Date.now(),
            response: successResponse,
        });

        return createSuccessResponse(requestId, successResponse, 201);
    } catch (error) {
        if (storeKey) {
            const record = idempotencyStore.get(storeKey);
            if (record?.status === 'in_progress') {
                idempotencyStore.delete(storeKey);
            }
        }
        if (error instanceof SchemaValidationError) {
            return createErrorResponse(requestId, 400, 'Invalid intel payload');
        }
        console.error(`[${requestId}] Error in quests/create:`, error);
        return createErrorResponse(requestId, 500, 'Internal server error');
    }
}
