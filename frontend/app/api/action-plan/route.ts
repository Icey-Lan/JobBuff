import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/llm';
import { ACTION_PLAN_SYSTEM_PROMPT, getActionPlanUserPrompt } from '@/lib/prompts';

export interface ActionPlanRequest {
    jd_info: string;
    match_analysis: object;
    user_resume: string;
}

export interface ActionPlanResponse {
    strategy: {
        tier: 'A档' | 'B档' | 'C档' | 'D档';
        tier_reason: string;
        effort: string;
        priority_actions: string[];
    };
    channels: Array<{
        name: string;
        priority: number;
        how_to_find: string;
        success_rate: 'high' | 'medium' | 'low';
    }>;
    greetings: {
        professional: {
            style: '专业风';
            target: string;
            content: string;
            word_count: number;
        };
        passionate: {
            style: '热情风';
            target: string;
            content: string;
            word_count: number;
        };
        concise: {
            style: '简洁风';
            target: string;
            content: string;
            word_count: number;
        };
    };
}

export async function POST(request: NextRequest) {
    try {
        const body: ActionPlanRequest = await request.json();

        // Validate required fields
        if (!body.jd_info || !body.user_resume) {
            return NextResponse.json(
                { error: 'Missing required fields: jd_info and user_resume' },
                { status: 400 }
            );
        }

        // Check for API key
        if (!process.env.LLM_API_KEY) {
            return NextResponse.json(
                { error: 'LLM_API_KEY not configured' },
                { status: 500 }
            );
        }

        const userPrompt = getActionPlanUserPrompt(
            body.jd_info,
            JSON.stringify(body.match_analysis || {}),
            body.user_resume
        );

        const result = await generateJSON<ActionPlanResponse>(ACTION_PLAN_SYSTEM_PROMPT, userPrompt);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in action-plan:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
