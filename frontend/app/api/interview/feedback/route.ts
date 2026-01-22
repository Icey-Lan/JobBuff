import { NextRequest, NextResponse } from 'next/server';
import { generateJSON } from '@/lib/llm';
import { FEEDBACK_SYSTEM_PROMPT, getFeedbackUserPrompt } from '@/lib/prompts';

export interface FeedbackRequest {
    question: string;
    key_points: string[];
    user_answer: string;
}

export interface FeedbackResponse {
    feedback: {
        overall_score: 'A (优秀)' | 'B (良好)' | 'C (及格)' | 'D (需改进)';
        highlights: string[];
        improvements: string[];
        suggestions: string[];
        revised_answer: string | null;
    };
}

export async function POST(request: NextRequest) {
    try {
        const body: FeedbackRequest = await request.json();

        if (!body.question || !body.user_answer) {
            return NextResponse.json(
                { error: 'Missing required fields: question and user_answer' },
                { status: 400 }
            );
        }

        if (!process.env.LLM_API_KEY) {
            return NextResponse.json(
                { error: 'LLM_API_KEY not configured' },
                { status: 500 }
            );
        }

        const userPrompt = getFeedbackUserPrompt(
            body.question,
            body.key_points || [],
            body.user_answer
        );

        const result = await generateJSON<FeedbackResponse>(FEEDBACK_SYSTEM_PROMPT, userPrompt);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in interview feedback:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
