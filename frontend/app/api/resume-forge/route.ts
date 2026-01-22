import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/llm';
import { FORGE_SYSTEM_PROMPT, getForgeUserPrompt } from '@/lib/prompts';

export interface ResumeForgeRequest {
    original_resume: string;
    target_jd: string;
    jd_analysis: object;
    match_analysis?: object;
    target_style?: string;
}

export interface ForgeResponse {
    forge_summary: {
        total_changes: number;
        estimated_match_boost: string;
        detected_style: string;
        key_improvements: string[];
        unmatched_jd_requirements: string[];
    };
    changes: Array<{
        id: string;
        module: string;
        location: string;
        priority: 'P0' | 'P1' | 'P2';
        title: string;
        issue: string;
        before: string;
        after: string;
        rationale: string;
        is_fabrication: boolean;
        fabrication_warning: string | null;
        needs_user_confirm: boolean;
        confirm_note: string | null;
    }>;
    forged_resume: object;
    markdown_export: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: ResumeForgeRequest = await request.json();

        if (!body.original_resume || !body.target_jd) {
            return NextResponse.json(
                { error: 'Missing required fields: original_resume and target_jd' },
                { status: 400 }
            );
        }

        if (!process.env.LLM_API_KEY) {
            return NextResponse.json(
                { error: 'LLM_API_KEY not configured' },
                { status: 500 }
            );
        }

        const userPrompt = getForgeUserPrompt(
            body.original_resume,
            body.target_jd,
            JSON.stringify(body.jd_analysis || {}),
            JSON.stringify(body.match_analysis || {}),
            body.target_style || 'auto'
        );

        const result = await generateJSON<ForgeResponse>(FORGE_SYSTEM_PROMPT, userPrompt);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in resume-forge:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
