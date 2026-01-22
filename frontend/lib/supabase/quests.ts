import { createClient } from '@/lib/supabase/client';

export interface QuestInput {
    userId: string;
    jdText: string;
    resumeText: string;
    targetPosition?: string;
    targetSalary?: string;
}

export interface QuestData {
    id: string;
    userId: string;
    jdText: string;
    resumeText: string;
    targetPosition?: string;
    targetSalary?: string;
    intel?: any;
    forge?: any;
    trial?: any;
    diffStatus?: Record<string, string>;
    status: 'intel' | 'forge' | 'trial' | 'completed' | 'archived';
    createdAt: string;
    updatedAt: string;
}

// Transform snake_case DB columns to camelCase
function transformQuest(row: any): QuestData {
    return {
        id: row.id,
        userId: row.user_id,
        jdText: row.jd_text,
        resumeText: row.resume_text,
        targetPosition: row.target_position,
        targetSalary: row.target_salary,
        intel: row.intel,
        forge: row.forge,
        trial: row.trial,
        diffStatus: row.diff_status,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

// Create a new quest
export async function createQuest(input: QuestInput): Promise<{ data: QuestData | null; error: any }> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('quests')
        .insert({
            user_id: input.userId,
            jd_text: input.jdText,
            resume_text: input.resumeText,
            target_position: input.targetPosition,
            target_salary: input.targetSalary,
            status: 'intel',
        })
        .select()
        .single();

    return {
        data: data ? transformQuest(data) : null,
        error,
    };
}

// Get a quest by ID
export async function getQuest(questId: string): Promise<{ data: QuestData | null; error: any }> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('id', questId)
        .single();

    return {
        data: data ? transformQuest(data) : null,
        error,
    };
}

// Update a quest
export async function updateQuest(
    questId: string,
    updates: Partial<{
        intel: any;
        forge: any;
        trial: any;
        diffStatus: Record<string, string>;
        status: string;
    }>
): Promise<{ error: any }> {
    const supabase = createClient();

    const dbUpdates: any = {
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
export async function getUserQuests(userId: string): Promise<{ data: QuestData[]; error: any }> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('quests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    return {
        data: data ? data.map(transformQuest) : [],
        error,
    };
}

// Delete a quest
export async function deleteQuest(questId: string): Promise<{ error: any }> {
    const supabase = createClient();

    const { error } = await supabase
        .from('quests')
        .delete()
        .eq('id', questId);

    return { error };
}

// Decrement user quota (call after successful quest creation)
export async function decrementQuota(userId: string): Promise<{ error: any }> {
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

        if (quota) {
            return await supabase
                .from('user_quotas')
                .update({ used_quota: quota.used_quota + 1 })
                .eq('id', userId);
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
