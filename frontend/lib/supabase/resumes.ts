import { createClient } from '@/lib/supabase/client';
import type { PostgrestError } from '@supabase/supabase-js';

type ResumeError = PostgrestError | Error | null;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// ==========================================================================
// Resume Material Library - CRUD Functions
// ==========================================================================

export interface ResumeData {
    id: string;
    userId: string;
    fileName: string;
    fileType: string;
    content: string;
    fileSize: number | null;
    lastUsedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ResumeInput {
    userId: string;
    fileName: string;
    fileType: string;
    content: string;
    fileSize?: number;
}

// Transform snake_case DB columns to camelCase
function transformResume(row: Record<string, unknown>): ResumeData {
    return {
        id: String(row.id),
        userId: String(row.user_id),
        fileName: String(row.file_name),
        fileType: String(row.file_type),
        content: String(row.content),
        fileSize: typeof row.file_size === 'number' ? row.file_size : null,
        lastUsedAt: typeof row.last_used_at === 'string' ? row.last_used_at : null,
        createdAt: String(row.created_at),
        updatedAt: String(row.updated_at),
    };
}

// Get all resumes for a user, sorted by last used (most recent first)
export async function getUserResumes(userId: string): Promise<{ data: ResumeData[]; error: ResumeError }> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', userId)
        .order('last_used_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

    return {
        data: data ? data.filter(isRecord).map(transformResume) : [],
        error,
    };
}

// Get a single resume by ID
export async function getResumeById(resumeId: string): Promise<{ data: ResumeData | null; error: ResumeError }> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', resumeId)
        .single();

    return {
        data: data && isRecord(data) ? transformResume(data) : null,
        error,
    };
}

// Create a new resume
export async function createResume(input: ResumeInput): Promise<{ data: ResumeData | null; error: ResumeError }> {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('resumes')
        .insert({
            user_id: input.userId,
            file_name: input.fileName,
            file_type: input.fileType,
            content: input.content,
            file_size: input.fileSize,
            last_used_at: new Date().toISOString(), // Mark as just used
        })
        .select()
        .single();

    return {
        data: data && isRecord(data) ? transformResume(data) : null,
        error,
    };
}

// Update last_used_at timestamp when a resume is used
export async function updateResumeUsage(resumeId: string): Promise<{ error: ResumeError }> {
    const supabase = createClient();

    const { error } = await supabase
        .from('resumes')
        .update({
            last_used_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', resumeId);

    return { error };
}

// Delete a resume
export async function deleteResume(resumeId: string): Promise<{ error: ResumeError }> {
    const supabase = createClient();

    const { error } = await supabase
        .from('resumes')
        .delete()
        .eq('id', resumeId);

    return { error };
}
