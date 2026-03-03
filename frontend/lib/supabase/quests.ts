import { createClient } from '@/lib/supabase/client';
import type { PostgrestError } from '@supabase/supabase-js';
import type { ForgeResponse, IntelResponse } from '@/lib/api-types';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

type QuestError = PostgrestError | Error | null;
type QuestStatus = 'intel' | 'forge' | 'trial' | 'completed' | 'archived';

interface TrialData {
    actionPlan?: unknown;
    questions?: unknown;
    userAnswers?: Record<string, { userAnswer?: string; feedback?: unknown }>;
}

export interface QuestInput {
    userId: string;
    jdText: string;
    resumeText: string;
    targetPosition?: string;
    targetSalary?: string;
    intel?: IntelResponse;
}

export interface QuestData {
    id: string;
    userId: string;
    jdText: string;
    resumeText: string;
    targetPosition?: string;
    targetSalary?: string;
    intel?: IntelResponse;
    forge?: (ForgeResponse & { customPreview?: string }) | null;
    trial?: TrialData | null;
    diffStatus?: Record<string, string>;
    status: QuestStatus;
    createdAt: string;
    updatedAt: string;
}

// Transform snake_case DB columns to camelCase
function transformQuest(row: Record<string, unknown>): QuestData {
    const rawDiffStatus = isRecord(row.diff_status) ? row.diff_status : {};
    const diffStatus = Object.entries(rawDiffStatus).reduce((acc, [key, value]) => {
        if (typeof value === 'string') {
            acc[key] = value;
        }
        return acc;
    }, {} as Record<string, string>);

    return {
        id: String(row.id),
        userId: String(row.user_id),
        jdText: String(row.jd_text),
        resumeText: String(row.resume_text),
        targetPosition: typeof row.target_position === 'string' ? row.target_position : undefined,
        targetSalary: typeof row.target_salary === 'string' ? row.target_salary : undefined,
        intel: (row.intel as IntelResponse | null) ?? undefined,
        forge: (row.forge as QuestData['forge']) ?? undefined,
        trial: (row.trial as TrialData | null) ?? undefined,
        diffStatus: Object.keys(diffStatus).length > 0 ? diffStatus : undefined,
        status: row.status as QuestStatus,
        createdAt: String(row.created_at),
        updatedAt: String(row.updated_at),
    };
}

// Create a new quest
export async function createQuest(input: QuestInput): Promise<{ data: QuestData | null; error: QuestError }> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('quests')
        .insert({
            user_id: input.userId,
            jd_text: input.jdText,
            resume_text: input.resumeText,
            target_position: input.targetPosition,
            target_salary: input.targetSalary,
            intel: input.intel,
            status: 'intel',
        })
        .select()
        .single();

    return {
        data: data && isRecord(data) ? transformQuest(data) : null,
        error,
    };
}

// Get a quest by ID
export async function getQuest(questId: string): Promise<{ data: QuestData | null; error: QuestError }> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('id', questId)
        .single();

    return {
        data: data && isRecord(data) ? transformQuest(data) : null,
        error,
    };
}

// Update a quest
export async function updateQuest(
    questId: string,
    updates: Partial<{
        intel: IntelResponse;
        forge: QuestData['forge'];
        trial: QuestData['trial'];
        diffStatus: Record<string, string>;
        status: QuestStatus;
    }>
): Promise<{ error: QuestError }> {
    const supabase = createClient();

    const dbUpdates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
    };

    if (updates.intel !== undefined) dbUpdates.intel = updates.intel;
    if (updates.forge !== undefined) dbUpdates.forge = updates.forge;
    if (updates.trial !== undefined) dbUpdates.trial = updates.trial;
    if (updates.diffStatus !== undefined) dbUpdates.diff_status = updates.diffStatus;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    const { error } = await supabase
        .from('quests')
        .update(dbUpdates)
        .eq('id', questId);

    return { error };
}

// Get all quests for a user
export async function getUserQuests(userId: string): Promise<{ data: QuestData[]; error: QuestError }> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    return {
        data: data ? data.filter(isRecord).map(transformQuest) : [],
        error,
    };
}

// Delete a quest
export async function deleteQuest(questId: string): Promise<{ error: QuestError }> {
    const supabase = createClient();

    const { error } = await supabase
        .from('quests')
        .delete()
        .eq('id', questId);

    return { error };
}

// Decrement user quota (call after successful quest creation)
export async function decrementQuota(userId: string): Promise<{ error: QuestError }> {
    const supabase = createClient();

    const { error } = await supabase.rpc('increment', {
        x: -1,
        row_id: userId,
    });

    // Fallback if RPC doesn't exist - do a regular update
    if (error) {
        const { data: quota } = await supabase
            .from('user_quotas')
            .select('used_quota')
            .eq('id', userId)
            .single();

        if (quota && typeof quota.used_quota === 'number') {
            const { error: fallbackError } = await supabase
                .from('user_quotas')
                .update({ used_quota: quota.used_quota + 1 })
                .eq('id', userId);
            return { error: fallbackError };
        }
    }

    return { error };
}

// Check if user has quota remaining
export async function checkQuota(userId: string): Promise<{ hasQuota: boolean; remaining: number }> {
    const supabase = createClient();

    const { data } = await supabase
        .from('user_quotas')
        .select('free_quota, used_quota')
        .eq('id', userId)
        .single();

    if (!data) {
        return { hasQuota: false, remaining: 0 };
    }

    const remaining = data.free_quota - data.used_quota;
    return { hasQuota: remaining > 0, remaining };
}
